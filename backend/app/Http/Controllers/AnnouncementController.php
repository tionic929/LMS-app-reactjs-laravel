<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = request()->user();

        $query = Announcement::with('creator:id,name,role');

        if ($user) {
            if ($user->isRole('learner')) {
                $query->whereIn('audience', ['learners', 'all']);
            } elseif ($user->isRole('instructor')) {
                $query->whereIn('audience', ['instructors', 'all']);
            }
            // admins see all
        }

        return $query->orderBy('id', 'desc')->get();
    }

    /**
     * Return only announcements created by users with role 'admin'.
     */
    public function adminIndex()
    {
        return Announcement::with('creator:id,name,role')
            ->whereNotNull('created_by')
            ->whereHas('creator', function ($q) {
                $q->where('role', 'admin');
            })
            ->orderBy('id', 'desc')
            ->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|string|in:news,event,general',
            'audience' => 'required|string|in:learners,instructors,all',
            'event_date' => 'nullable|date',
            'event_time' => 'nullable|string|max:32',
            'location' => 'nullable|string|max:255',
        ]);

        if ($data['type'] === 'event') {
            $eventValidation = $request->validate([
                'event_date' => 'required|date',
                'event_time' => 'required|string|max:32',
                'location' => 'required|string|max:255',
            ]);
            $data = array_merge($data, $eventValidation);
        }

        $user = $request->user();

        if (!$user || !in_array($user->role, ['admin', 'instructor'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data['created_by'] = $user->id;

        $announcement = Announcement::create($data);
        $announcement->load('creator:id,name,role');

        return response()->json($announcement, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Announcement $announcement)
    {
        return $announcement;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Announcement $announcement)
    {
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'type' => 'sometimes|required|string|in:news,event,general',
            'audience' => 'sometimes|required|string|in:learners,instructors,all',
            'event_date' => 'sometimes|nullable|date',
            'event_time' => 'sometimes|nullable|string|max:32',
            'location' => 'sometimes|nullable|string|max:255',
        ]);

        if (($data['type'] ?? $announcement->type) === 'event') {
            $request->validate([
                'event_date' => 'required|date',
                'event_time' => 'required|string|max:32',
                'location' => 'required|string|max:255',
            ]);
        }

        $user = $request->user();

        if (!$user || (!$user->isRole('admin') && !($user->isRole('instructor') && $announcement->created_by == $user->id))) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $announcement->update($data);
        $announcement->load('creator:id,name,role');

        return response()->json($announcement, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Announcement $announcement)
    {
        $user = request()->user();

        if (!$user || (!$user->isRole('admin') && !($user->isRole('instructor') && $announcement->created_by == $user->id))) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $announcement->delete();

        return response()->noContent();
    }
}
