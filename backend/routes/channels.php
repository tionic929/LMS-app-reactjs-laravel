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

Broadcast::channel('course.{courseId}', function ($user, $courseId) {

    $course = \App\Models\Course::find($courseId);

    if (! $course) {
        return false;
    }

    return $user->role === 'admin' ||
        $user->id === $course->instructor_id ||
        $course->users()->where('user_id', $user->id)->exists();
});
