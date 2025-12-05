<?php

use Illuminate\Support\Facades\Broadcast;

// Role-based channel
Broadcast::channel('role.{role}', function ($user, $role) {
    return $user->role === $role;
});

// Private user channel
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
