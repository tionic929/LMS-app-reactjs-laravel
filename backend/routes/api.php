<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AnnouncementController;


Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/logout', [AuthController::class, 'logout']);
Route::resource('users', UsersController::class)
     ->except(['create', 'edit', 'index']); 
// get authenticated user on current session
Route::get('/user', [AuthController::class, 'user']);
// paginated list with query search and filters
Route::get('/users', [UsersController::class, 'getPaginatedUsers']);

Route::middleware('auth:sanctum')->group(function () {
    // CRUD
});

// Announcements API - public endpoints (no auth required)
Route::get('announcements', [AnnouncementController::class, 'index']);
Route::get('announcements/{announcement}', [AnnouncementController::class, 'show']);
Route::post('announcements', [AnnouncementController::class, 'store']);
Route::put('announcements/{announcement}', [AnnouncementController::class, 'update']);
Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy']);
