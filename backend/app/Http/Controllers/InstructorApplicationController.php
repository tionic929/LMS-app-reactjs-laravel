<?php

namespace App\Http\Controllers;

use App\Models\InstructorApplication;
use App\Models\InstructorProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InstructorApplicationController extends Controller
{
    /**
     * List applications (optional ?status=pending)
     */
    public function index(Request $request)
    {
        $status = $request->query('status', 'pending');

        // We load the 'user' relationship which contains the 'avatar' column
        $applications = InstructorApplication::with(['user' => function($query) {
                $query->select(
                    'id', 
                    'name', 
                    'email', 
                    'avatar', 
                    'role', 
                    'is_enabled', 
                    'is_confirmed', 
                    'is_banned_from_comments'
                );
            }])
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform to include full URL for the avatar
        $applications->transform(function ($app) {
            if ($app->user && $app->user->avatar) {
                $app->user->avatar_url = asset('storage/' . $app->user->avatar);
            } else {
                $app->user->avatar_url = null;
            }
            return $app;
        });

        return response()->json($applications);
    }

    public function getInstructorAnalytics(Request $request)
    {        
        $avatars = User::where('role', 'instructor')
            ->whereNotNull('avatar')
            ->select('avatar')
            ->get()
            ->map(function($user) {
                return asset('storage/' . $user->avatar);
            });  

        $analytics = DB::table('instructor_applications')
            ->select(
                DB::raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as totalPending'),
                DB::raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as totalApproved'),
                DB::raw('SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as totalRejected')
            )
            ->first();

        $latest = InstructorApplication::with(['user' => function($q) {
            $q->select('id', 'name', 'email', 'avatar');
        }])->orderBy('created_at', 'desc')->first();

        $oldest = InstructorApplication::with(['user' => function($q) {
            $q->select('id', 'name', 'email', 'avatar');
        }])->orderBy('created_at', 'asc')->first();

        $totalCount = InstructorApplication::whereIn('status', ['pending'])->count();

        $data = collect([$latest, $oldest])->filter()->unique('id')->values();
        
        return response()->json([
            'totalApproved' => (int) $analytics->totalApproved,
            'totalPending'  => (int) $analytics->totalPending,
            'totalRejected' => (int) $analytics->totalRejected,
            
            'total_count'   => $totalCount,
            'data'          => $data,

            'avatars' => $avatars,
        ]);
    }

    public function getApplicationRates(Request $request)
    {
        $sixMonthsAgo = now()->subMonths(6)->startOfMonth();

        $rates = DB::table('instructor_applications')
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('COUNT(*) as totalApplications'),
                DB::raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approvedCount'),
                DB::raw('SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejectedCount'),
                // Optional: Calculate percentage rate directly in SQL
                DB::raw('ROUND((SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as approvalRate')
            )
            ->where('created_at', '>=', $sixMonthsAgo)
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->get();

        return response()->json($rates);
    }

    // public function getPendingApplication(Request $request){
        

    //     return response()->json([
    //         'total_count' => $finalApplications->count(),
    //         'data' => $finalApplications,
    //     ]);
    // }

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
