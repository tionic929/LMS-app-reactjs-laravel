<?php

namespace App\Events;

use App\Models\CourseComment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $comment;
    public $action;
    public $courseId;

    public function __construct(CourseComment $comment, string $action, int $courseId)
    {
        $this->comment = $comment->load('user', 'replyToUser');
        $this->action = $action;
        $this->courseId = $courseId;
    }

    public function broadcastOn(): array
    {
        return [new Channel('course.' . $this->courseId)];
    }

    public function broadcastAs()
    {
        return 'CommentEvent';
    }
}
