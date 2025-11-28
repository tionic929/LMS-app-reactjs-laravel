<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AnnouncementController;


Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {
    // Users CRUD (admin only logic can be inside controller/policies)
    Route::resource('users', UsersController::class)
         ->except(['create', 'edit', 'index']);

    // Authenticated user details
    Route::get('/user', [AuthController::class, 'user']);

    // Paginated users list
    Route::get('/users', [UsersController::class, 'getPaginatedUsers']);

    // Admin-authored announcements (placed BEFORE resource to avoid parameter capture of 'admin')
    Route::get('announcements/admin', [AnnouncementController::class, 'adminIndex']);

    // Announcements resource (admin checks for write actions are inside controller methods)
    Route::resource('announcements', AnnouncementController::class);
});
