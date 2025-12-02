<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\NotificationService; // 💡 Import your service

class LogUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response)  $next
     * @return \Illuminate\Http\Response
     */
    public function handle(Request $request, Closure $next)
    {
        // Allow the request to proceed first
        $response = $next($request);

        // --- Post-Request Logic ---
        
        // 1. Check if the user is logged in
        if (Auth::check()) {
            
            $user = Auth::user();
            
            // 2. Only proceed if the user is NOT an admin/instructor
            // Adjust the roles as needed (e.g., only learners)
            if ($user->role === 'learner' || $user->role === 'instructor') {
                
                // 3. Only notify on successful GET requests (viewing pages)
                if ($request->isMethod('GET') && $response->status() === 200) {
                    
                    $path = $request->path();
                    
                    // Exclude noisy routes like static files or auth checks
                    if (!str_contains($path, 'api/user') && !str_contains($path, 'logout')) {
                        
                        $message = "User **{$user->name}** ({$user->id}) is viewing: `/{$path}`";
                        
                        $notify = new NotificationService();
                        
                        // TargetType 'role' and TargetId 'admin' to notify all admins
                        $notify->send(
                            'role', 
                            'admin', // Target the admin role room
                            $message, 
                            'info', 
                            $request->fullUrl() // Optional: link to the page
                        );
                        
                        // Optional: Log the activity to the console for debugging
                        \Log::info("[ACTIVITY] Notified admins: {$message}");
                    }
                }
            }
        }

        return $response;
    }
}