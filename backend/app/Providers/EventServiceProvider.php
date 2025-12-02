<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Events\UserActivityEvent;
use App\Listeners\ProcessUserActivity;

class EventServiceProvider extends ServiceProvider
{

    protected $listen = [
        UserActivityEvent::class => [
            ProcessUserActivity::class, // Register the listener
        ],
    ];
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
