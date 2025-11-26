<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\DiscussionsController;

Route::resource('courses', CourseController::class);
Route::resource('notifications', NotificationsController::class);
Route::resource('announcements', DiscussionsController::class);
Route::resource('users', UsersController::class)->except(['create', 'edit']);

Route::middleware(['auth:sanctum', 'role:admin'])
    ->get('/admin/dashboard', fn() => ['message' => 'Admin Access']);

Route::middleware(['auth:sanctum', 'role:instructor'])
    ->get('/instructor/courses', fn() => ['message' => 'Instructor Access']);

Route::middleware(['auth:sanctum', 'role:learner'])
    ->get('/learner/classes', fn() => ['message' => 'Learner Access']);
