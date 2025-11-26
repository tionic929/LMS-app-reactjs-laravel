<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AnnouncementController;

Route::resource('users', UsersController::class);


// Announcements API - public endpoints (no auth required)
Route::get('announcements', [AnnouncementController::class, 'index']);
Route::get('announcements/{announcement}', [AnnouncementController::class, 'show']);
Route::post('announcements', [AnnouncementController::class, 'store']);
Route::put('announcements/{announcement}', [AnnouncementController::class, 'update']);
Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy']);

Route::middleware(['auth:sanctum', 'role:admin'])
    ->get('/admin/dashboard', fn() => ['message' => 'Admin Access']);

Route::middleware(['auth:sanctum', 'role:instructor'])
    ->get('/instructor/courses', fn() => ['message' => 'Instructor Access']);

Route::middleware(['auth:sanctum', 'role:learner'])
    ->get('/learner/classes', fn() => ['message' => 'Learner Access']);

// Provide a CSRF token route under the API prefix so it matches `api/*` CORS paths
Route::get('/csrf', function () {
    return csrf_token();
});