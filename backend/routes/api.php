<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\CoursesController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\DiscussionsController;

Route::resource('users', UsersController::class);
Route::resource('courses', CoursesController::class);
Route::resource('notifications', NotificationsController::class);
Route::resource('announcements', DiscussionsController::class);
