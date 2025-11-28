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
        return Announcement::orderBy('id', 'desc')->get();
    }

    /**
     * Return only announcements created by users with role 'admin'.
     */
    public function adminIndex()
    {
        return Announcement::whereNotNull('created_by')
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
            'type' => 'required|string|in:info,warning,success,error,maintenance',
        ]);

        $user = $request->user();

        if (!$user || !$user->isRole('admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data['created_by'] = $user->id;

        $announcement = Announcement::create($data);

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
            'type' => 'sometimes|required|string|in:info,warning,success,error,maintenance',
        ]);

        $user = $request->user();

        if (!$user || !$user->isRole('admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $announcement->update($data);

        return response()->json($announcement, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Announcement $announcement)
    {
        $user = request()->user();

        if (!$user || !$user->isRole('admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $announcement->delete();

        return response()->noContent();
    }
}
