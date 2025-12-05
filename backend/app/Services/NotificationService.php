<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\NotificationRead;
use App\Events\NewNotification;
use Illuminate\Support\Facades\DB;  
use Illuminate\Support\Facades\Log; 

class NotificationService
{
    public function send($targetType, $targetId, $message, $type = 'info', $link = null)
    {
        try {
            // 💡 FIX: Set the value for the database column
            $notifiableIdForDB = $targetId;

            // If targeting a role, use a generic integer ID (like 0) 
            // to satisfy the 'notifiable_id' column data type constraint.
            if ($targetType === 'role') {
                $notifiableIdForDB = 0;
            }

            // 1. Save in DB
            $notification = Notification::create([
                'notifiable_type' => $targetType,
                'notifiable_id'   => $notifiableIdForDB, // Use the safe integer ID
                'message'         => $message,
                'type'            => $type,
                'link_url'        => $link,
            ]);

            // 2. Mark unread for users (The original logic uses $targetId which is the string 'admin')
            if ($targetType === 'user') {
                NotificationRead::create([
                    'user_id' => $targetId,
                    'notification_id' => $notification->id,
                    'is_read' => false,
                ]);
            }

            if ($targetType === 'role') {
                // This lookup still uses the original $targetId (the string 'admin'), which is correct.
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

            // 3. Dispatch Socket Job
            event(new \App\Events\NewNotification($message));

            return $notification;
            
        } catch (\Exception $e) {
            Log::error("Notification Service Database Failure - FINAL:", [
                'error' => $e->getMessage(),
                'payload' => ['targetType' => $targetType, 'targetId' => $targetId, 'message' => $message]
            ]);
            throw $e; 
        }
    }
}