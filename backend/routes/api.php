<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;


Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'role:admin'])
    ->get('/admin/dashboard', fn() => ['message' => 'Admin Access']);

Route::middleware(['auth:sanctum', 'role:instructor'])
    ->get('/instructor/courses', fn() => ['message' => 'Instructor Access']);

Route::middleware(['auth:sanctum', 'role:learner'])
    ->get('/learner/classes', fn() => ['message' => 'Learner Access']);
