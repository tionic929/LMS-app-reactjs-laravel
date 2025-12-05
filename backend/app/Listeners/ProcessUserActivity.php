<?php

namespace App\Listeners;

use App\Events\UserActivityEvent;
use App\Models\ActivityLog;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class ProcessUserActivity implements ShouldQueue
{
    use InteractsWithQueue;

    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the event: log activity, create notification, broadcast to frontend.
     */
    public function handle(UserActivityEvent $event): void
    {
        try {
            $user = $event->user;

            // 1️⃣ Compose a unified message
            $message = "Audit: User {$user->name} ({$user->role}) just: {$event->activity}";

            Log::info("ProcessUserActivity: START for user ID {$user->id} - Message: {$message}");

            // 2️⃣ Store in Activity Log
            ActivityLog::create([
                'user_id' => $user->id,
                'activity' => $message,  // link message directly
                'route' => $event->route,
            ]);
            Log::info("ProcessUserActivity: ActivityLog created successfully.");

            // 3️⃣ Create notification for admins
            if ($user->role == 'admin') {
                $this->notificationService->send(
                    'role',          // Target type
                    'admin',         // Target role
                    $message,        // Use same message
                    'info',          // Type
                    $event->route    // Link
                );
                Log::info("ProcessUserActivity: Notification created and broadcasted successfully.");
            } else {
                Log::info("ProcessUserActivity: Notification skipped for admin user.");
            }

            Log::info("ProcessUserActivity: FINISHED handling event.");

        } catch (\Exception $e) {
            Log::error("ProcessUserActivity: ERROR", [
                'user_id' => $event->user->id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e; // ensure job fails and errors are visible
        }
    }
}
