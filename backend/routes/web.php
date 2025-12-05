<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/test-notification', function() {
    event(new \App\Events\NewNotification('Hello from Controller!'));
    return 'Notification sent!';
});

Route::get('/test-notif', function () {
    broadcast(new \App\Events\NewNotification("🔥 Test notification at " . now()));

    return "sent";
});