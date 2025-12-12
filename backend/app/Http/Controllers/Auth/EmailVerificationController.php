<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class EmailVerificationController extends Controller
{
    public function sendEmailVerificationCode(Request $request)
    {
        Log::info('Email Verification Triggered', ['email' => $request->email]);

        $request->validate([
            'email' => 'required|email'
        ]);

        // Generate code
        $token = Str::random(6);

        DB::table('email_verification_codes')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $token,
                'created_at' => now()
            ]
        );

        Mail::send(
            'email.sendEmailVerifyCode',
            ['token' => $token],
            function ($message) use ($request) {
                $message->to($request->email);
                $message->subject('Verify Your Email');
            }
        );

        return response()->json([
            'message' => 'Verification code sent!'
        ]);
    }
}
