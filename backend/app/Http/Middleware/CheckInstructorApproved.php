<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckInstructorApproved
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        // Only apply to instructors
        if ($user && $user->role === 'instructor' && !$user->is_confirmed) {
            // Return JSON for SPA / API
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Your instructor application is still pending approval.'
                ], 403);
            }

            // Or redirect for traditional web
            return redirect()->route('login')->with('error', 'Your instructor application is still pending approval.');
        }

        return $next($request);
    }
}
