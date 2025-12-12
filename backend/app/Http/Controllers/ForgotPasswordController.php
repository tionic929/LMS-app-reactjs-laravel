<?php
namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ForgotPasswordController extends Controller 
{

    public function submitForgetPasswordForm(Request $request) {
        // Debug logging
        Log::info('ForgotPassword called', ['email' => $request->email]);

        // Validate email
        $request->validate([
            'email' => 'required|email|exists:users'
        ]);

        // Generate reset token
        $token = Str::random(64);

        // Store in database
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => $token,
            'created_at' => Carbon::now()
        ]);

        // Build reset URL (React SPA route)
        $resetUrl = env('FRONTEND_URL', 'http://localhost:5173') . "/reset-password/$token?email=" . urlencode($request->email);

        // Send email
        Mail::send('email.forgetPassword', ['resetUrl' => $resetUrl], function($message) use($request) {
            $message->to($request->email);
            $message->subject('Reset Your Password');
        });

        return response()->json([
            'message' => 'A password reset link has been sent to your email.'
        ], 200);
    }


    public function showResetPasswordForm($token) {
        return view('auth.forgetPasswordLink', ['token' => $token]);
    }

    public function submitResetPasswordForm(Request $request) {
        $request->validate([
            'password' => 'required|string|min:6|confirmed',
            'token' => 'required'
        ]);

        $reset = DB::table('password_reset_tokens')
            ->where('token', $request->token)
            ->first();

        if (!$reset) {
            return response()->json(['message' => 'Invalid token'], 400);
        }

        User::where('email', $reset->email)->update([
            'password' => Hash::make($request->password)
        ]);

        DB::table('password_reset_tokens')->where('token', $request->token)->delete();

        return response()->json(['message' => 'Password has been reset successfully']);
    }
}