<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\NotificationRead;
use App\Events\NewNotification;
use Illuminate\Support\Facades\DB;  
use Illuminate\Support\Facades\Log; 

class NotificationService
{
    /**
     * Send a notification.
     *
     * @param string $targetType 'user', 'role', or 'public'
     * @param mixed $targetId User ID, role string, or null for public
     * @param string $message
     * @param string $type
     * @param string|null $link
     * @return Notification
     */
    public function send(string $targetType, $targetId, string $message, string $type = 'info', string $link = null)
    {
        try {
            // Determine notifiable_id for DB
            $notifiableIdForDB = $targetType === 'role' || $targetType === 'public' ? 0 : $targetId;

            // Determine role column value
            $roleForDB = $targetType === 'role' ? $targetId : null;

            // 1. Save notification in DB
            $notification = Notification::create([
                'notifiable_type' => $targetType,
                'notifiable_id'   => $notifiableIdForDB,
                'message'         => $message,
                'type'            => $type,
                'link_url'        => $link,
                'role'            => $roleForDB,
            ]);

            // 2. Mark as unread for users
            if ($targetType === 'user') {
                NotificationRead::create([
                    'user_id' => $targetId,
                    'notification_id' => $notification->id,
                    'is_read' => false,
                ]);
            }

            if ($targetType === 'role') {
                $users = DB::table('users')->where('role', $targetId)->pluck('id');

                if ($users->isEmpty()) {
                    Log::warning("NotificationService: No users found for role: {$targetId}");
                }

                foreach ($users as $uid) {
                    NotificationRead::create([
                        'user_id' => $uid,
                        'notification_id' => $notification->id,
                        'is_read' => false,
                    ]);
                }
            }

            if ($targetType === 'public') {
                $users = DB::table('users')->pluck('id');
                foreach ($users as $uid) {
                    NotificationRead::create([
                        'user_id' => $uid,
                        'notification_id' => $notification->id,
                        'is_read' => false,
                    ]);
                }
            }

            // 3. Dispatch broadcast/event
            event(new NewNotification($message, $targetType, $targetId));

            return $notification;

        } catch (\Exception $e) {
            Log::error("NotificationService Error:", [
                'error' => $e->getMessage(),
                'payload' => compact('targetType', 'targetId', 'message', 'type', 'link')
            ]);
            throw $e; 
        }
    }
}
