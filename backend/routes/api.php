<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\TestNotifyController;
use App\Http\Controllers\DiscussionsController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\NotificationController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
});

Route::get('/notifications', [NotificationController::class, 'index']);
Route::get('/test-notification', [NotificationController::class, 'test']);

// Course routes
Route::resource('courses', CourseController::class);

// for admin roles
Route::middleware('auth:sanctum' , 'log.activity')->group(function () {
    Route::post('/courses/{course}/enroll', [CourseController::class, 'enroll']);
    Route::post('/courses/{course}/leave', [CourseController::class, 'leave']);
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

// for learners and instructors
Route::get('announcements', [AnnouncementController::class, 'index']);
Route::get('announcements/{announcement}', [AnnouncementController::class, 'show']);


// for admins
Route::middleware(['auth:sanctum', 'role:admin', 'log.activity'])->group(function () {
    Route::post('announcements', [AnnouncementController::class, 'store']);
    Route::put('announcements/{announcement}', [AnnouncementController::class, 'update']);
    Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy']);
});

Route::resource('discussions', DiscussionsController::class);


// 1. PUBLIC ROUTES (No authentication middleware required)
// These routes should be accessible to everyone.
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/registerInstructor', [AuthController::class, 'registerInstructor']);

Route::middleware(['auth:sanctum'])->group(function () {
    
    // THESE ROUTES WILL WORK because the client is now sending the token
    Route::get('/users/analytics', [UsersController::class, 'getUsersAnalytics']);
    Route::get('/users', [UsersController::class, 'getPaginatedUsers']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // The GET method of this resource will also be covered by 'log.activity'
    Route::resource('users', UsersController::class)->except(['create', 'edit', 'index']);
});

Route::middleware('auth:sanctum')->group(function () {
    
    // NOTE: If you are using Sanctum for API authentication, you should call 
    Route::post('/logout', [AuthController::class, 'logout']); 
    
    // 💡 NEW ROUTE: Destroys the session cookie.
    Route::post('/logout-session', [AuthController::class, 'logoutSession']);
    Route::put('/users/{user}/toggle', [UsersController::class, 'toggleUserField']);
});

// Admin-authored announcements (placed BEFORE resource to avoid parameter capture of 'admin')
Route::get('announcements/admin', [AnnouncementController::class, 'adminIndex']);

// Announcements resource (admin checks for write actions are inside controller methods)
Route::resource('announcements', AnnouncementController::class);

