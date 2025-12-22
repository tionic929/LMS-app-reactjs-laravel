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

            $message = "{$event->activity}";
            Log::info("[ProcessUserActivity] START for user ID {$user->id} - Message: {$message}");

            $activityLog = ActivityLog::create([
                'user_id' => $user->id,
                'activity' => $message,
                'route' => $event->route,
            ]);

            Log::info("[ProcessUserActivity] ActivityLog created", [
                'activity_log_id' => $activityLog->id,
                'user_id' => $user->id,
                'activity' => $activityLog->activity,
            ]);

            // 2️⃣ Check activity log object
            if (!$activityLog || !$activityLog->id) {
                Log::error("[ProcessUserActivity] ActivityLog creation failed, ID missing!", [
                    'activity_log' => $activityLog
                ]);
                return;
            }

            if ($user->role === 'admin') {
                Log::info("[ProcessUserActivity] Sending notification for admin role...");
                $notification = $this->notificationService->send(
                    'role',          // Target type
                    'admin',         // Target role
                    $message,        // Message
                    'info',          // Type
                    $event->route,   // Link
                    $activityLog->id     // Pass activity log object
                );

                Log::info("[ProcessUserActivity] Notification created successfully", [
                    'notification_id' => $notification->id ?? null,
                    'activity_log_id' => $activityLog->id,
                ]);
            } else {
                Log::info("[ProcessUserActivity] Notification skipped for non-admin user");
            }

            Log::info("[ProcessUserActivity] FINISHED handling event");

        } catch (\Exception $e) {
            Log::error("[ProcessUserActivity] ERROR handling event", [
                'user_id' => $event->user->id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e; // Ensure job fails and errors are visible
        }
    }
}
