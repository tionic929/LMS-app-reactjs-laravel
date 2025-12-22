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
use App\Events\UserActivityEvent;
use Illuminate\Support\Facades\Log;
use App\Models\InstructorApplication;
use App\Models\InstructorProfile;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        Log::info('Registration attempt started.', [
            'email' => $request->email,
            'role' => $request->role,
            'has_avatar' => $request->hasFile('avatarFile'),
            'has_resume' => $request->hasFile('resumeFile'),
            'all_inputs' => $request->except(['password', 'passwordConfirmation'])
        ]);

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
            // 'avatarFile' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'avatarFile' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',

            // 'resumeFile' => 'nullable|mimes:pdf,doc,docx|max:5120', // Added resume validation
        ];

        $conditionalRules = [];
        
        try {
            $credentials = $request->validate(array_merge($baseRules, $conditionalRules));
            Log::info('Validation passed for user: ' . $credentials['email']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed.', ['errors' => $e->errors()]);
            throw $e;
        }

        try {
            $user = DB::transaction(function () use ($request, $credentials) {
                
                // --- FILE HANDLING ---
                $avatarPath = null;
                if ($request->hasFile('avatarFile')) {
                    $avatarPath = $request->file('avatarFile')->store('avatars', 'public');
                    Log::info('Avatar uploaded successfully.', ['path' => $avatarPath]);
                }

                $resumePath = null;
                if ($request->hasFile('resumeFile')) {
                    $resumePath = $request->file('resumeFile')->store('resumes', 'public');
                    Log::info('Resume uploaded successfully.', ['path' => $resumePath]);
                }
                // --- DATA FORMATTING ---
                $middleInitialFormatted = $credentials['middleInitial'] ? $credentials['middleInitial'] . '.' : '';
                $fullName = trim("{$credentials['firstName']} {$middleInitialFormatted} {$credentials['lastName']}");

                // 1. CREATE USER
                $user = User::create([
                    'name' => $fullName,
                    'email' => $credentials['email'],
                    'password' => Hash::make($credentials['password']),
                    'role' => $credentials['role'],
                    'avatar' => $avatarPath, 
                ]);

                Log::info('User record created.', ['user_id' => $user->id, 'role' => $user->role]);

                // 2. CONSTRUCT PROFILE DATA
                $profileData = [
                    'user_id' => $user->id,
                    'first_name' => $credentials['firstName'],
                    'middle_initial' => $credentials['middleInitial'],
                    'last_name' => $credentials['lastName'],
                    'date_of_birth' => $credentials['dateOfBirth'],
                    'phone_number' => $credentials['phoneNumber'],
                    'address' => $credentials['address'],
                ];

                // 3. CREATE PROFILE RECORD
                if ($credentials['role'] == 'learner') {
                    Learner::create($profileData);
                    Log::info('Learner profile created.');
                } elseif ($credentials['role'] == 'instructor') {
                    InstructorApplication::create(array_merge($profileData, [
                        'status' => 'pending',
                        'resume_path' => $resumePath, // Save the resume path here
                    ]));
                    Log::info('Instructor application record created.');
                }

                return $user;
            });

            Log::info('Registration transaction completed successfully.');

            $message = 'Registration successful.';
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
                    'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Registration Error Exception!', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'message' => 'Registration failed due to a server error.',
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

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();

        // ❌ Block pre-instructors if application is not approved
        if ($user->role === 'instructor') {
            $application = InstructorApplication::where('user_id', $user->id)->first();
            
            if (!$application || $application->status !== 'approved') {
                Auth::logout(); // optional: revoke session if using web guard
                return response()->json([
                    'message' => 'Your instructor application is still pending approval.'
                ], 403);
            }
        }
        
        // 2. CREATE AND RETURN THE SANCTUM TOKEN
        // This is the CRITICAL step your previous code was missing.
        $token = $user->createToken('auth_token')->plainTextToken; 
        
        // Load relationships for the user object being returned
        $user->load(['admin', 'instructor', 'learner']);

        return response()->json([
            'message' => 'Logged in successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token, // 💡 Send the token back!
            'token_type' => 'Bearer',
        ], 200);
    }

    public function user(Request $request)
    {
        $u = $request->user()->load(['admin', 'instructor', 'learner']);
        // Ensure avatar_url accessor is included
        return $u;
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->tokens()->delete(); 
            return response()->json(['message' => 'Logged out']);
        }
    }

    public function logoutSession(Request $request){
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

}
