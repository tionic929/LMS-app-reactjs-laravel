<?php
namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;


class UserActivityEvent implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $user;
    public $activity;
    public $route;

    public function __construct(User $user, string $activity, string $route)
    {
        $this->user = $user;
        $this->activity = $activity;
        $this->route = $route;
    }
    public function broadcastOn()
    {
        return new PrivateChannel('user-activity'); // or PublicChannel
    }
}