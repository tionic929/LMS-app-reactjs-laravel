<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\UsersController;


Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {
    // CRUD
    Route::resource('users', UsersController::class)
         ->except(['create', 'edit', 'index']); 
    // get authenticated user on current session
    Route::get('/user', [AuthController::class, 'user']);
    // paginated list with query search and filters
    Route::get('/users', [UsersController::class, 'getPaginatedUsers']);
});

Route::middleware(['auth:sanctum', 'role:admin'])
    ->get('/admin/dashboard', fn() => ['message' => 'Admin Access']);

Route::middleware(['auth:sanctum', 'role:instructor'])
    ->get('/instructor/courses', fn() => ['message' => 'Instructor Access']);

Route::middleware(['auth:sanctum', 'role:learner'])
    ->get('/learner/classes', fn() => ['message' => 'Learner Access']);
