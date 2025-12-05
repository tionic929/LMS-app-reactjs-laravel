<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Registers /broadcasting/auth
        Broadcast::routes(); 
        Broadcast::routes(['middleware' => ['web', 'auth']]);
        // Load channel definitions
        require base_path('routes/channels.php');
    }
}
