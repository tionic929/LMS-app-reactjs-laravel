<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\DiscussionsController;
use App\Http\Controllers\AnnouncementController;

// Course routes
Route::resource('courses', CourseController::class);

// for admin roles
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/courses/{course}/enroll', [CourseController::class, 'enroll']);
    Route::post('/courses/{course}/leave', [CourseController::class, 'leave']);
    Route::get('/courses/{course}/learners', [CourseController::class, 'learners']);
    Route::delete('/courses/{course}/learners/{userId}', [CourseController::class, 'removeLearner']);
    Route::get('/courses/{course}/join-requests', [CourseController::class, 'joinRequests']);
    Route::post('/courses/{course}/join-requests/{requestId}/accept', [CourseController::class, 'acceptRequest']);
    Route::post('/courses/{course}/join-requests/{requestId}/reject', [CourseController::class, 'rejectRequest']);
    Route::post('/courses/{course}/materials', [CourseController::class, 'addMaterial']);
    Route::put('/courses/{course}/materials/{materialId}', [CourseController::class, 'updateMaterial']);
    Route::delete('/courses/{course}/materials/{materialId}', [CourseController::class, 'deleteMaterial']);
    Route::post('/courses/{course}/comments', [CourseController::class, 'addComment']);
    Route::post('/courses/{course}/announcements', [CourseController::class, 'addAnnouncement']);
    Route::delete('/courses/{course}/announcements/{announcementId}', [CourseController::class, 'deleteAnnouncement']);
    Route::put('/courses/{course}/comments/{comment}', [CourseController::class, 'updateComment']);
    Route::delete('/courses/{course}/comments/{comment}', [CourseController::class, 'deleteComment']);
    Route::post('/courses/{course}/ban-user/{user}', [CourseController::class, 'banUserFromComments']);
    Route::post('/courses/{course}/unban-user/{user}', [CourseController::class, 'unbanUserFromComments']);
    Route::post('/courses/{course}/comments/{comment}/vote', [CourseController::class, 'voteComment']);
    Route::delete('/courses/{course}/comments/{comment}/vote', [CourseController::class, 'removeVoteFromComment']);
    Route::get('/courses/{course}/comments/{comment}/votes', [CourseController::class, 'getCommentVote']);
});

// for learners and instructors
Route::get('announcements', [AnnouncementController::class, 'index']);
Route::get('announcements/{announcement}', [AnnouncementController::class, 'show']);

// for admins
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('announcements', [AnnouncementController::class, 'store']);
    Route::put('announcements/{announcement}', [AnnouncementController::class, 'update']);
    Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy']);
});

Route::resource('notifications', NotificationsController::class);
Route::resource('discussions', DiscussionsController::class);

//route get users/analytics should be above route:resource users with except: 'create' 'edit' 'index'
Route::get('/users/analytics', [UsersController::class, 'getUsersAnalytics']);

Route::resource('users', UsersController::class)->except(['create', 'edit', 'index']);

Route::get('/user', [AuthController::class, 'user']);
Route::get('/users', [UsersController::class, 'getPaginatedUsers']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/registerInstructor', [AuthController::class, 'registerInstructor']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/users/{user}/toggle', [UsersController::class, 'toggleUserField']);
});

    // Admin-authored announcements (placed BEFORE resource to avoid parameter capture of 'admin')
    Route::get('announcements/admin', [AnnouncementController::class, 'adminIndex']);

    // Announcements resource (admin checks for write actions are inside controller methods)
    Route::resource('announcements', AnnouncementController::class);


