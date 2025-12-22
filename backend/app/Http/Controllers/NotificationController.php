<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NotificationRead;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $notifications = NotificationRead::where('user_id', $userId)
            ->with('notification.activityLog.user') // important chain
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($read) {
                $notification = $read->notification;
                $user = $notification->activityLog->user ?? null; // <-- here

                return [
                    'id' => $notification->id,
                    'read_id' => $read->id,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'created_at' => $notification->created_at,
                    'is_read' => $read->is_read,
                    'user' => $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'avatar_url' => $user->avatar_url ?? $this->generateAvatar($user->name),
                    ] : [
                        'id' => null,
                        'name' => 'System',
                        'avatar_url' => $this->generateAvatar('System'),
                    ],
                ];
            });

        return response()->json($notifications);
    }

    /**
     * Helper to generate default avatar URL using initials.
     */
    private function generateAvatar(string $name): string
    {
        $encodedName = urlencode($name);
        return "https://ui-avatars.com/api/?name={$encodedName}&background=cbd5e1&color=475569";
    }

    public function markAsRead($id)
    {
        $read = NotificationRead::where('user_id', Auth::id())
                ->where('notification_id', $id)
                ->first();

        if ($read) {
            $read->update(['is_read' => true]);
        }

        return response()->json(['success' => true]);
    }

    public function clearAll()
    {
        $userId = Auth::id();
        
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $updatedCount = NotificationRead::where('user_id', $userId)
                                        ->where('is_read', false)
                                        ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All unread notifications marked as read.',
            'count' => $updatedCount
        ]);
    }
}
