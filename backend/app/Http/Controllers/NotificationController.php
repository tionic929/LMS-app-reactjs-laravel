<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NotificationRead;
use Illuminate\Support\Facades\Auth;
use App\Services\NotificationService;

class NotificationController extends Controller
{

    public function test(Request $request)
    {
        // Default to User 1 if no ID is provided in the URL
        $targetUserId = $request->input('id', 1); 
        
        $notify = new NotificationService;
        
        // Send to the specific user ID
        $notify->send(
            "user", 
            $targetUserId, 
            "This is a test notification from Postman at " . now()->toTimeString(), 
            "success"
        );

        return response()->json([
            "sent" => true, 
            "target_user" => $targetUserId,
            "message" => "Check your frontend bell icon!"
        ]);
    }

    public function index()
    {
        $userId = Auth::id();

        // Fetch notifications assigned to this user via the pivot/read table
        // We join with the main 'notifications' table to get the message/type  
        $notifications = NotificationRead::where('user_id', $userId)
            ->with('notification') // Assuming you have this relationship defined
            ->where('is_read', false) // Optional: only show unread
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($read) {
                // Flatten the structure for the frontend
                return [
                    'id' => $read->notification->id,
                    'read_id' => $read->id,
                    'message' => $read->notification->message,
                    'type' => $read->notification->type,
                    'created_at' => $read->notification->created_at,
                    'is_read' => $read->is_read
                ];
            });

        return response()->json($notifications);
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
}