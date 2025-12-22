<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use App\Models\Notification;
use Illuminate\Broadcasting\PrivateChannel; // Use PrivateChannel for role.{roleName}

class NewNotification implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $notification;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn(): Channel | array
    {
        return new PrivateChannel('role.admin');
    }

    public function broadcastAs()
    {
        return 'RoleNotification';
    }
}


