<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Learner;
use App\Models\Instructor;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Validator;

class AuthController extends Controller
{
    public function register(Request $request){
        $baseRules = [
            'email' => ['required', 'email', 'unique:users'],
            'password' => 'required|min:1', 
            'passwordConfirmation' => 'required|same:password',
            'role' => ['required', Rule::in(['learner', 'instructor'])],

            'firstName' => 'required|string|max:50',
            'middleInitial' => 'nullable|string|max:1',
            'lastName' => 'required|string|max:50',
            'dateOfBirth' => 'required|date|before:today', 
            'phoneNumber' => 'required|string|max:20',
            'address' => 'required|string|max:255',
        ];

        // 2. DEFINE CONDITIONAL RULES
        $conditionalRules = [];

        // if($request->role == 'learner'){
        //     $conditionalRules =[
        //         // 'gradeLevel' => 'required|integer|min:1',
        //         // 'section' => 'required|string|max:50',
        //     ];
        // } elseif($request->role == 'instructor'){
        //     $conditionalRules = [
        //         // 'department' => 'required|string|max:100',
        //         // 'specialization' => 'required|string|max:100',
        //     ];
        // }

        // 3. MERGE ALL RULES AND VALIDATE ONCE
        $credentials = $request->validate(array_merge($baseRules, $conditionalRules));

        try{
            // 🔥 THE FIX: Ensure only necessary variables are passed to the closure.
            // Since all data is in $credentials, we only need to pass $credentials.
            $user = DB::transaction(function() use ($credentials){
                
                // Use validated data for full name construction
                $middleInitialFormatted = $credentials['middleInitial'] ? $credentials['middleInitial'] . '.' : '';
                $fullName = trim("{$credentials['firstName']} {$middleInitialFormatted} {$credentials['lastName']}");

                // 1. CREATE USER (User table)
                $user = User::create([
                    'name' => $fullName,
                    'email' => $credentials['email'],
                    'password' => Hash::make($credentials['password']),
                    'role' => $credentials['role'],
                ]);
                
                // 2. CONSTRUCT PROFILE DATA (Using SNAKE_CASE keys for the database)
                $profileData = [
                    'user_id' => $user->id,
                    'first_name' => $credentials['firstName'],
                    'middle_initial' => $credentials['middleInitial'],
                    'last_name' => $credentials['lastName'],
                    'date_of_birth' => $credentials['dateOfBirth'],
                    'phone_number' => $credentials['phoneNumber'],
                    'address' => $credentials['address'],
                ];


                // 3. CREATE PROFILE RECORD (Learner or Instructor)

                if($credentials['role'] == 'learner'){
                    Learner::create(array_merge($profileData));
                } elseif($credentials['role'] == 'instructor'){
                    Instructor::create(array_merge($profileData, [
                        'status' => 'pending',
                    ]));
                }

                return $user;
            });

            $message = 'Registration successful.';
            $token = $user->createToken('auth_token')->plainTextToken;

            if ($user->role === 'instructor') {
                $message = 'Instructor application received successfully. Your account is pending admin approval.';
            }
            
            return response()->json([
                'message' => $message,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ], 201);

        } catch(\Exception $e) {
            Log::error('Registration Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'message' => 'Registration failed due to a server error. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }

    }

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
