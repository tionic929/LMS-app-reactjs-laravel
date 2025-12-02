<?php

namespace App\Listeners;

use App\Events\UserActivityEvent;
use App\Models\ActivityLog;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log; // 💡 CRITICAL: Ensure Log Facade is imported

class ProcessUserActivity implements ShouldQueue
{
    use InteractsWithQueue;

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        // Constructor injection remains correct
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the event, with robust error logging.
     */
    public function handle(UserActivityEvent $event): void
    {
        try {
            // Log 1: Confirmation that the listener started
            Log::info("ProcessUserActivity: STARTING for user ID: {$event->user->id}");

            // 1. Create the Activity Log (Should be successful)
            ActivityLog::create([
                'user_id' => $event->user->id,
                'activity' => $event->activity,
                'route' => $event->route,
            ]);

            // Log 2: Confirmation that ActivityLog::create() finished successfully
            Log::info("ProcessUserActivity: ActivityLog CREATED. Checking notification condition.");

            // 2. Trigger Notification Logic
            // The notification code runs ONLY if the user is NOT an admin.
            if ($event->user->role !== 'instructor') { 
                
                $notificationMessage = "Audit: User {$event->user->name} ({$event->user->role}) just: {$event->activity}";
                
                // This is where the code is currently failing if $event->user->role is 'admin' OR 
                // if there is an issue inside NotificationService::send().
                $this->notificationService->send(
                    'role',          // Target type
                    'admin',         // Target ID
                    $notificationMessage,
                    'info',          // Type
                    $event->route    // Link
                );

                Log::info("ProcessUserActivity: Notification SERVICE CALL COMPLETED successfully."); // Log 3
            } else {
                 Log::info("ProcessUserActivity: Notification SKIPPED - User is admin."); // Log 3b
            }
            
            // Log 4: Confirmation that the handle method reached the end
            Log::info("ProcessUserActivity: FINISHED handle method.");

        } catch (\Exception $e) {
            // 💡 CRITICAL: Catch any exception thrown by NotificationService::send()
            Log::error("FATAL ERROR IN ProcessUserActivity LISTENER:", [
                'user_id' => $event->user->id,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // Re-throw the exception. This forces the job to crash and fail, 
            // preventing the misleading 'DONE' status and ensuring the error is recorded.
            throw $e; 
        }
    }
}