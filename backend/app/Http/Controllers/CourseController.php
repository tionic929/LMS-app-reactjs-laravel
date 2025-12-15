<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\CourseJoinRequest;
use App\Models\CourseMaterial;
use App\Models\CourseComment;
use App\Models\CommentVote;
use Illuminate\Support\Facades\Storage;
use App\Models\CourseAnnouncement;
use App\Models\CourseCommentBan;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use Illuminate\Http\Request;
use App\Events\CommentEvent;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Course::with('instructor')
            ->where('status', 'active');



        // Filter by privacy
        if ($request->has('privacy')) {
            $query->where('privacy', $request->privacy);
        }

        $courses = $query->get();

        return response()->json($courses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseRequest $request)
    {
        $course = Course::create([
            'instructor_id' => auth()->id(),
            'title' => $request->title,
            'content' => $request->content,
            'privacy' => $request->privacy,
            'capacity' => $request->capacity,
        ]);

        return response()->json($course->load('instructor'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        $course->load([
            'instructor',
            'activeLearners',
            'joinRequests.user',
            'materials',
            'comments' => function ($query) {
                $query->whereNull('parent_id')
                    ->with(['user', 'replyToUser', 'replies'])
                    ->orderBy('created_at', 'desc');
            },
            'announcements'
        ]);

        // Check if user is the instructor
        $isInstructor = auth()->check() && $course->instructor_id === auth()->id();

        // Check if user is admin
        $isAdmin = auth()->check() && auth()->user()->role === 'admin';

        // Check enrollment status for authenticated user
        $isEnrolled = false;
        $hasPendingRequest = false;

        if (auth()->check()) {
            $isEnrolled = CourseEnrollment::where('course_id', $course->id)
                ->where('user_id', auth()->id())
                ->where('status', 'active')
                ->exists();

            $hasPendingRequest = CourseJoinRequest::where('course_id', $course->id)
                ->where('user_id', auth()->id())
                ->where('status', 'pending')
                ->exists();
        }

        if (!$isInstructor && !$isAdmin && !$isEnrolled) {
            if ($course->privacy === 'private') {
                return response()->json([
                    'course' => [
                        'id' => $course->id,
                        'title' => $course->title,
                        'privacy' => $course->privacy,
                        'instructor' => $course->instructor,
                        'capacity' => $course->capacity,
                        'current_enrolled' => $course->current_enrolled,
                ],
                'is_instructor' => false,
                'is_admin' => false,
                'is_enrolled' => false,
                'has_pending_request' => $hasPendingRequest,
            ]);
            }
        }

        // Filter sensitive data based on permissions
        if (!$isInstructor && !$isAdmin && !$isEnrolled) {
            $course->unsetRelation('joinRequests');
        }

        return response()->json([
            'course' => $course,
            'is_instructor' => $isInstructor,
            'is_admin' => $isAdmin,
            'is_enrolled' => $isEnrolled,
            'has_pending_request' => $hasPendingRequest,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseRequest $request, Course $course)
    {
        $course->update($request->validated());

        return response()->json($course->load('instructor'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        // Check if user is the instructor
        if (auth()->id() !== $course->instructor_id && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Soft delete by setting status to disbanded
        $course->update(['status' => 'disbanded']);

        return response()->json(['message' => 'Course disbanded successfully']);
    }

    /**
     * Get learners for a course
     */
    public function learners(Course $course)
    {
        if (auth()->id() !== $course->instructor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $learners = $course->activeLearners()
            ->select('users.id', 'users.name', 'users.email')
            ->get()
            ->map(function ($learner) {
                return [
                    'id' => $learner->id,
                    'name' => $learner->name,
                    'email' => $learner->email,
                    'enrolled_at' => $learner->pivot->created_at->format('n/j/Y'),
                    'status' => $learner->pivot->status,
                ];
            });

        return response()->json($learners);
    }

    /**
     * Remove a learner from course
     */
    public function removeLearner(Course $course, $userId)
    {
        if (auth()->id() !== $course->instructor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $enrollment = CourseEnrollment::where('course_id', $course->id)
            ->where('user_id', $userId)
            ->first();

        // If the learner is currently counted as enrolled (active status) adjust counters
        if ($enrollment && $enrollment->status === 'active') {
            $course->decrement('current_enrolled');
        }

        // Delete enrollment record so user can re-enroll later (unique constraint requires removal)
        if ($enrollment) {
            $enrollment->delete();
        }

        // Also remove any accepted join request so learner can submit a new request in future
        CourseJoinRequest::where('course_id', $course->id)
            ->where('user_id', $userId)
            ->where('status', 'accepted')
            ->delete();

        return response()->json(['message' => 'Learner removed successfully']);
    }

    /**
     * Get join requests for a course
     */
    public function joinRequests(Course $course)
    {
        if (auth()->id() !== $course->instructor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $requests = $course->joinRequests()->with('user')->get();

        return response()->json($requests);
    }

    /**
     * Accept a join request
     */
    public function acceptRequest(Course $course, $requestId)
    {
        if (auth()->id() !== $course->instructor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request = CourseJoinRequest::findOrFail($requestId);

        if ($request->course_id !== $course->id) {
            return response()->json(['message' => 'Invalid request'], 400);
        }

        // Check capacity
        if ($course->current_enrolled >= $course->capacity) {
            return response()->json(['message' => 'Course is full'], 400);
        }

        $request->update(['status' => 'accepted']);

        // Reuse existing enrollment row if it exists with status 'removed'
        $existingEnrollment = CourseEnrollment::where('course_id', $course->id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existingEnrollment) {
            if ($existingEnrollment->status === 'active') {
                return response()->json(['message' => 'Already enrolled'], 400);
            }
            // Reactivate removed enrollment
            $existingEnrollment->update(['status' => 'active']);
            $course->increment('current_enrolled');
        } else {
            CourseEnrollment::create([
                'course_id' => $course->id,
                'user_id' => $request->user_id,
                'status' => 'active',
            ]);
            $course->increment('current_enrolled');
        }

        return response()->json(['message' => 'Request accepted']);
    }

    /**
     * Reject a join request
     */
    public function rejectRequest(Course $course, $requestId)
    {
        if (auth()->id() !== $course->instructor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request = CourseJoinRequest::findOrFail($requestId);

        if ($request->course_id !== $course->id) {
            return response()->json(['message' => 'Invalid request'], 400);
        }

        $request->update(['status' => 'rejected']);

        return response()->json(['message' => 'Request rejected']);
    }

    /**
     * Add material to course
     */
    public function addMaterial(Request $request, Course $course)
    {
        if (auth()->id() !== $course->instructor_id && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:file,video,link',
            'description' => 'nullable|string',
            'file' => 'required_if:type,file|file|max:10240', // 10MB max for files
            'url' => 'required_if:type,video,link|url',
        ]);

        $url = null;
        $fileType = null;

        // Handle file upload
        if ($request->type === 'file' && $request->hasFile('file')) {
            $file = $request->file('file');
            $fileType = $file->getClientOriginalExtension();
            $originalFilename = $file->getClientOriginalName();
            $filename = time() . '_' . $originalFilename;
            $path = $file->storeAs('course_materials', $filename, 'public');
            $url = asset('storage/' . $path);
        } else {
            $url = $request->url;
            $originalFilename = null;
        }

        $material = $course->materials()->create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'file_type' => $fileType,
            'original_filename' => $originalFilename,
            'url' => $url,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json($material, 201);
    }

    /**
     * Delete material from course
     */
    public function deleteMaterial(Course $course, $materialId)
    {
        if (auth()->id() !== $course->instructor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $material = CourseMaterial::where('course_id', $course->id)
            ->findOrFail($materialId);

        // Delete the associated file if it's a file type
        if ($material->type === 'file') {
            $path = str_replace(asset('storage/'), '', $material->url);
            Storage::disk('public')->delete($path);
        }

        $material->delete();

        return response()->json(['message' => 'Material deleted']);
    }

    /**
     * Update material in course
     */
    public function updateMaterial(Request $request, Course $course, $materialId)
    {
        if (auth()->id() !== $course->instructor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $material = CourseMaterial::where('course_id', $course->id)
            ->findOrFail($materialId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'url' => 'nullable|url',
            'file' => 'nullable|file|max:10240', // 10MB max for files
        ]);

        // Handle file upload if provided
        if ($request->hasFile('file')) {
            // Delete old file if it exists
            if ($material->type === 'file' && $material->url) {
                $oldPath = str_replace(asset('storage/'), '', $material->url);
                if (\Storage::disk('public')->exists($oldPath)) {
                    \Storage::disk('public')->delete($oldPath);
                }
            }

            $file = $request->file('file');
            $fileType = $file->getClientOriginalExtension();
            $originalFilename = $file->getClientOriginalName();
            $filename = time() . '_' . $originalFilename;
            $path = $file->storeAs('course_materials', $filename, 'public');
            $url = asset('storage/' . $path);

            $material->update([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'url' => $url,
                'file_type' => $fileType,
                'original_filename' => $originalFilename,
            ]);
        } else {
            $material->update($validated);
        }

        return response()->json($material);
    }

    /**
     * Add comment to course
     */
    public function addComment(Request $request, Course $course)
    {

        $isInstructor = auth()->check() && $course->instructor_id === auth()->id();
        $isAdmin = auth()->check() && auth()->user()->role === 'admin';
        $isEnrolled = $course->enrollments()
            ->where('user_id', auth()->id())
            ->where('status', 'active')
            ->exists();

            if (!$isInstructor && !$isAdmin && !$isEnrolled) {
                return response()->json(['message' => 'You must be enrolled to this course to comment'], 403);
            }

        // Check if user is banned from commenting in this course
        $isBanned = CourseCommentBan::where('course_id', $course->id)
            ->where('user_id', auth()->id())
            ->exists();

        if ($isBanned) {
            return response()->json(['message' => 'You are banned from commenting in this course'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
            'parent_id' => 'nullable|exists:course_comments,id',
            'reply_to_user_id' => 'nullable|exists:users,id',
        ]);

        $comment = $course->comments()->create([
            'user_id' => auth()->id(),
            'content' => $validated['content'],
            'parent_id' => $validated['parent_id'] ?? null,
            'reply_to_user_id' => $validated['reply_to_user_id'] ?? null,
        ]);

        broadcast(new CommentEvent($comment, 'created', $course->id));

        return response()->json($comment->load('user', 'replyToUser'), 201);
    }

    public function updateComment(Request $request, Course $course, CourseComment $comment)
    {
        if ($comment->course_id !== $course->id) {
            return response()->json(['message' => 'Comment not found'], 400);
        }

        $canEdit = (
            auth()->id() === $course->instructor_id ||
            auth()->user()->role === 'admin' ||
            auth()->id() === $comment->user_id
        );

        if (!$canEdit) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment->update([
            'content' => $validated['content'],
        ]);

        broadcast (new CommentEvent($comment, 'updated', $course->id));

        return response()->json($comment->load('user', 'replyToUser'));
    }

    public function deleteComment(Course $course, CourseComment $comment)
    {
        if ($comment->course_id !== $course->id) {
            return response()->json(['message' => 'Comment not found'], 400);
        }

        $canDelete = (
            auth()->id() === $course->instructor_id ||
            auth()->user()->role === 'admin' ||
            auth()->id() === $comment->user_id
        );

        if (!$canDelete) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        broadcast (new CommentEvent($comment, 'deleted', $course->id));

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }

    /**
     * Vote on a comment
     */
    public function voteComment(Request $request, Course $course, CourseComment $comment)
    {
        if ($comment->course_id !== $course->id) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        $isInstructor = auth()->check() && $course->instructor_id === auth()->id();
        $isAdmin = auth()->check() && auth()->user()->role === 'admin';
        $isEnrolled = $course->enrollments()
            ->where('user_id', auth()->id())
            ->where('status', 'active')
            ->exists();

        if (!$isInstructor && !$isAdmin && !$isEnrolled) {
            return response()->json(['message' => 'You must be enrolled to this course to vote'], 403);
        }

        $validated = $request->validate([
            'vote_type' => 'required|in:upvote,downvote',
        ]);

        // Check if user already voted
        $existingVote = CommentVote::where('course_comment_id', $comment->id)
            ->where('user_id', auth()->id())
            ->first();

        if ($existingVote) {
            if ($existingVote->vote_type === $validated['vote_type']) {
                // Remove vote if clicking the same vote type
                $existingVote->delete();
                return response()->json([
                    'message' => 'Vote removed',
                    'upvotes_count' => $comment->fresh()->upvotes_count,
                    'downvotes_count' => $comment->fresh()->downvotes_count,
                    'user_vote' => null,
                ]);
            } else {
                // Update vote type if clicking the opposite
                $existingVote->update(['vote_type' => $validated['vote_type']]);
                return response()->json([
                    'message' => 'Vote updated',
                    'upvotes_count' => $comment->fresh()->upvotes_count,
                    'downvotes_count' => $comment->fresh()->downvotes_count,
                    'user_vote' => $validated['vote_type'],
                ]);
            }
        }

        // Create new vote
        CommentVote::create([
            'course_comment_id' => $comment->id,
            'user_id' => auth()->id(),
            'vote_type' => $validated['vote_type'],
        ]);

        return response()->json([
            'message' => 'Vote recorded',
            'upvotes_count' => $comment->fresh()->upvotes_count,
            'downvotes_count' => $comment->fresh()->downvotes_count,
            'user_vote' => $validated['vote_type'],
        ], 201);
    }

    /**
     * Add announcement to course
     */
    public function addAnnouncement(Request $request, Course $course)
    {
        if (auth()->id() !== $course->instructor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $announcement = $course->announcements()->create($validated);

        return response()->json($announcement, 201);
    }

    /**
     * Delete announcement
     */
    public function deleteAnnouncement(Course $course, $announcementId)
    {
        if (auth()->id() !== $course->instructor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $announcement = CourseAnnouncement::where('course_id', $course->id)
            ->findOrFail($announcementId);

        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted']);
    }

    /**
     * Update announcement
     */
    public function updateAnnouncement(Request $request, Course $course, $announcementId)
    {
        if (auth()->id() !== $course->instructor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $announcement = CourseAnnouncement::where('course_id', $course->id)
            ->findOrFail($announcementId);

        $announcement->update($validated);

        return response()->json($announcement);
    }

    /**
     * Enroll in a public course or request to join a private course
     */
    public function enroll(Course $course)
    {
        $user = auth()->user();

        // Check any existing enrollment (could be removed)
        $existingEnrollment = CourseEnrollment::where('course_id', $course->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingEnrollment && $existingEnrollment->status === 'active') {
            return response()->json(['message' => 'Already enrolled'], 400);
        }

        // Check if course is full
        if ($course->current_enrolled >= $course->capacity) {
            return response()->json(['message' => 'Course is full'], 400);
        }

        if ($course->privacy === 'public') {
            // Directly enroll for public courses
            if ($existingEnrollment) {
                // Reactivate removed enrollment
                $existingEnrollment->update(['status' => 'active']);
            } else {
                CourseEnrollment::create([
                    'course_id' => $course->id,
                    'user_id' => $user->id,
                    'status' => 'active',
                ]);
            }
            $course->increment('current_enrolled');
            return response()->json(['message' => 'Successfully enrolled']);
        } else {
            // Create join request for private courses
            $existingRequest = CourseJoinRequest::where('course_id', $course->id)
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->first();

            if ($existingRequest) {
                return response()->json(['message' => 'Join request already pending'], 400);
            }

            // If a previous accepted request exists (user was removed later), delete it to allow a fresh pending request
            CourseJoinRequest::where('course_id', $course->id)
                ->where('user_id', $user->id)
                ->where('status', 'accepted')
                ->delete();

            CourseJoinRequest::create([
                'course_id' => $course->id,
                'user_id' => $user->id,
                'status' => 'pending',
            ]);
            return response()->json(['message' => 'Join request submitted']);
        }
    }

    /**
     * Leave a course (unenroll)
     */
    public function leave(Course $course)
    {
        $user = auth()->user();

        $enrollment = CourseEnrollment::where('course_id', $course->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Not enrolled in this course'], 400);
        }

        $enrollment->delete();
        $course->decrement('current_enrolled');

        return response()->json(['message' => 'Successfully left the course']);
    }

    /**
     * Ban a learner from commenting in a course
     */
    public function banLearner(Course $course, $userId)
    {
        $user = auth()->user();

        // Only course instructor or admin can ban
        if ($user->id !== $course->instructor_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if already banned
        $existingBan = CourseCommentBan::where('course_id', $course->id)
            ->where('user_id', $userId)
            ->first();

        if ($existingBan) {
            return response()->json(['message' => 'User is already banned from commenting'], 400);
        }

        // Create ban
        CourseCommentBan::create([
            'course_id' => $course->id,
            'user_id' => $userId,
            'banned_by_user_id' => $user->id,
            'reason' => request('reason'),
        ]);

        return response()->json(['message' => 'User banned from commenting successfully']);
    }

    /**
     * Unban a learner from commenting in a course
     */
    public function unbanLearner(Course $course, $userId)
    {
        $user = auth()->user();

        // Only course instructor or admin can unban
        if ($user->id !== $course->instructor_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ban = CourseCommentBan::where('course_id', $course->id)
            ->where('user_id', $userId)
            ->first();

        if (!$ban) {
            return response()->json(['message' => 'User is not banned'], 400);
        }

        $ban->delete();

        return response()->json(['message' => 'User unbanned from commenting successfully']);
    }

    /**
     * Get all banned learners for a course
     */
    public function getBannedLearners(Course $course)
    {
        $user = auth()->user();

        // Only course instructor or admin can view bans
        if ($user->id !== $course->instructor_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $bans = CourseCommentBan::where('course_id', $course->id)
            ->with(['user', 'bannedBy'])
            ->get();

        return response()->json($bans);
    }
}
