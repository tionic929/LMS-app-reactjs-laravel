<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\CourseJoinRequest;
use App\Models\CourseMaterial;
use App\Models\CourseComment;
use App\Models\CourseAnnouncement;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use Illuminate\Http\Request;

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

        // Only show public courses or courses the user is enrolled in
        if (auth()->check()) {
            $userId = auth()->id();
            $query->where(function ($q) use ($userId) {
                $q->where('privacy', 'public')
                    ->orWhere('instructor_id', $userId)
                    ->orWhereHas('enrollments', function ($enrollQ) use ($userId) {
                        $enrollQ->where('user_id', $userId)
                            ->where('status', 'active');
                    });
            });
        } else {
            $query->where('privacy', 'public');
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
            'comments.user',
            'announcements'
        ]);

        // Check if user is the instructor
        $isInstructor = auth()->check() && $course->instructor_id === auth()->id();

        // Filter sensitive data based on permissions
        if (!$isInstructor) {
            $course->unsetRelation('joinRequests');
        }

        return response()->json([
            'course' => $course,
            'is_instructor' => $isInstructor,
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
        if (auth()->id() !== $course->instructor_id) {
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

        if ($enrollment) {
            $enrollment->update(['status' => 'removed']);
            $course->decrement('current_enrolled');
        }

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

        CourseEnrollment::create([
            'course_id' => $course->id,
            'user_id' => $request->user_id,
            'status' => 'active',
        ]);

        $course->increment('current_enrolled');

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
        if (auth()->id() !== $course->instructor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:file,video,link',
            'file_type' => 'nullable|string',
            'url' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $material = $course->materials()->create($validated);

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

        $material->delete();

        return response()->json(['message' => 'Material deleted']);
    }

    /**
     * Add comment to course
     */
    public function addComment(Request $request, Course $course)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $comment = $course->comments()->create([
            'user_id' => auth()->id(),
            'content' => $validated['content'],
        ]);

        return response()->json($comment->load('user'), 201);
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
}
