<?php
namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserActivityEvent
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
}