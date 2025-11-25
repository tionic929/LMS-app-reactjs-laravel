<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required'
        ]);

        // removed debug dump to allow normal login flow
        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $request->session()->regenerate();
        $user = Auth::user()->load(['admin', 'instructor', 'learner']);

        return response()->json(['message' => 'Logged in'], 200);
    }

    public function user(Request $request)
    {
        return $request->user()->load(['admin', 'instructor', 'learner']);
    }

    public function logout(Request $request)
    {
        \Log::info("LOGOUT START", [
            "csrf_token" => $request->header("X-XSRF-TOKEN"),
            "session_id" => $request->session()->getId(),
        ]);

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        \Log::info("LOGOUT END", [
            "new_session_id" => $request->session()->getId(),
            "new_csrf" => csrf_token(),
        ]);

        return response()->json(['message' => 'Logged out']);
    }

}
