<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/csrf', function () {
    return csrf_token();
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
