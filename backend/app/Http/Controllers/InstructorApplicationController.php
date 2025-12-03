<?php

namespace App\Http\Controllers;

use App\Models\InstructorApplication;
use App\Models\InstructorProfile;
use App\Models\User;
use Illuminate\Http\Request;

class InstructorApplicationController extends Controller
{
    /**
     * List applications (optional ?status=pending)
     */
    public function index(Request $request)
    {
        $status = $request->query('status', 'pending');

        $applications = InstructorApplication::with('user')
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($applications);
    }

    /**
     * Show one application
     */
    public function show($id)
    {
        $app = InstructorApplication::with('user')->findOrFail($id);
        return response()->json($app);
    }

    /**
     * Approve an instructor application
     */
    public function approve($id)
    {
        $app = InstructorApplication::with('user')->findOrFail($id);

        if ($app->status !== 'pending') {
            return response()->json([
                'message' => 'Application already processed.'
            ], 400);
        }

        // 1. Create instructor profile
        InstructorProfile::create([
            'user_id' => $app->user_id,
            'experience' => $app->experience,
            'bio' => $app->bio,
        ]);

        // 2. Update user role
        $app->user->update(['role' => 'instructor']);

        // 3. Mark application as approved
        $app->update(['status' => 'approved']);

        // 4. (Optional) Broadcast to socket server
        // event(new InstructorApproved($app->user));

        return response()->json([
            'message' => 'Instructor application approved.',
            'app' => $app
        ]);
    }

    /**
     * Reject an instructor application
     */
    public function reject($id)
    {
        $app = InstructorApplication::findOrFail($id);

        if ($app->status !== 'pending') {
            return response()->json([
                'message' => 'Application already processed.'
            ], 400);
        }

        $app->update(['status' => 'rejected']);

        // event(new InstructorRejected($app->user));

        return response()->json([
            'message' => 'Instructor application rejected.',
            'app' => $app
        ]);
    }
}
