<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;

class NewNotification implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $message;
    public $targetType; // 'user'|'role'|'public'
    public $targetId;

    public function __construct(string $message, string $targetType = 'user', $targetId = null)
    {
        $this->message = $message;
        $this->targetType = $targetType;
        $this->targetId = $targetId;
    }

    public function broadcastOn(): Channel | array
    {
        if ($this->targetType === 'user' && $this->targetId) {
            return new PrivateChannel('user.' . $this->targetId);
        }

        if ($this->targetType === 'role' && $this->targetId) {
            // role channels are public to authenticated users with that role
            return new PrivateChannel('role.' . $this->targetId);
        }

        // fallback to a public channel
        return new Channel('public');
    }

    public function broadcastAs()
    {
        return 'NewNotification';
    }

    public function broadcastWith()
    {
        return [
            'message' => $this->message,
            'target_type' => $this->targetType,
            'target_id' => $this->targetId,
        ];
    }
}


