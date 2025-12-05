<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('role.{role}', function ($user, $role) {
    return $user->role === $role;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return $user->id == $id;
});

Broadcast::channel('public', function ($user) {
    return true; // any authenticated user
});
