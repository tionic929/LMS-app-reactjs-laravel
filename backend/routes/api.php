<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\DiscussionsController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AuthController;

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Get authenticated user
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user()->load(['admin', 'instructor', 'learner']);
});

// Course routes
Route::resource('courses', CourseController::class);

// Course specific routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/courses/{course}/learners', [CourseController::class, 'learners']);
    Route::delete('/courses/{course}/learners/{userId}', [CourseController::class, 'removeLearner']);
    Route::get('/courses/{course}/join-requests', [CourseController::class, 'joinRequests']);
    Route::post('/courses/{course}/join-requests/{requestId}/accept', [CourseController::class, 'acceptRequest']);
    Route::post('/courses/{course}/join-requests/{requestId}/reject', [CourseController::class, 'rejectRequest']);
    Route::post('/courses/{course}/materials', [CourseController::class, 'addMaterial']);
    Route::delete('/courses/{course}/materials/{materialId}', [CourseController::class, 'deleteMaterial']);
    Route::post('/courses/{course}/comments', [CourseController::class, 'addComment']);
    Route::post('/courses/{course}/announcements', [CourseController::class, 'addAnnouncement']);
    Route::delete('/courses/{course}/announcements/{announcementId}', [CourseController::class, 'deleteAnnouncement']);
});

// System-wide announcements (admin only for create/update/delete)
Route::get('announcements', [AnnouncementController::class, 'index']);
Route::get('announcements/{announcement}', [AnnouncementController::class, 'show']);
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('announcements', [AnnouncementController::class, 'store']);
    Route::put('announcements/{announcement}', [AnnouncementController::class, 'update']);
    Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy']);
});

Route::resource('notifications', NotificationsController::class);
Route::resource('discussions', DiscussionsController::class);
Route::resource('users', UsersController::class)->except(['create', 'edit']);

Route::middleware(['auth:sanctum', 'role:admin'])
    ->get('/admin/dashboard', fn() => ['message' => 'Admin Access']);

Route::middleware(['auth:sanctum', 'role:instructor'])
    ->get('/instructor/courses', fn() => ['message' => 'Instructor Access']);

Route::middleware(['auth:sanctum', 'role:learner'])
    ->get('/learner/classes', fn() => ['message' => 'Learner Access']);
