<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\Rule;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Include new boolean fields in the index method
        $users = User::select('id', 'name', 'email', 'role', 'is_enabled', 'is_confirmed', 'is_banned_from_comments')
            ->orderBy('id', 'asc')
            ->paginate(10);
        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Handles paginated fetching, filtering, and searching of users.
     */
    public function getPaginatedUsers(Request $request)
    {
        $search = $request->query('search');
        $role = $request->query('role');
        
        // Include new boolean fields for the frontend display
        $query = User::select('id', 'name', 'email', 'role', 'is_enabled', 'is_confirmed', 'is_banned_from_comments')->orderBy('id', 'asc');

        // Apply Search Filter (Name, Email, or ID)
        if ($search) {
            $query->where(function ($q) use ($search) {
                // Check for numeric search separately to handle potential ID search without SQL errors
                if (is_numeric($search)) {
                    $q->where('id', $search);
                }
                
                // Optimized search terms (using full text search if configured, otherwise standard LIKE)
                $q->orWhere('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");

                // Note: If full text index is configured, use the following instead:
                // $q->orWhereFullText(['name', 'email'], $search);
            });
        }

        if ($role && $role !== 'all') {
            $query->where('role', $role);
        }

        return response()->json($query->paginate(5));
    }

    public function getUsersAnalytics()
    {
        $totalUsers = User::count();

        $activeUsers = User::where('is_enabled', true)
                        ->where('is_banned_from_comments', false)
                        ->count();

        // 3. Pending Instructors (role = 'instructor' AND is_confirmed = false)
        $unconfirmedInstructors = User::where('role', 'instructor')
                                    ->where('is_confirmed', false)
                                    ->count();

        $bannedUsers = User::where('is_banned_from_comments', true)
                        ->count();

        return response()->json([
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'unconfirmedInstructors' => $unconfirmedInstructors,
            'bannedUsers' => $bannedUsers,
        ]);
    }
    
    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'role' => 'required|in:admin,instructor,learner',
            'password' => 'required|string|min:8',
        ]);
        
        $user = new User;
        $user->name = $request->name;
        $user->email = $request->email;
        $user->password = Hash::make($request->password);
        $user->role = $request->role;
        
        // New fields are handled by defaults in the migration, but you can override here if needed
        $user->is_enabled = true;
        $user->is_confirmed = false; // Only relevant for instructors
        $user->is_banned_from_comments = false;

        $user->save();
        return response()->json($user, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, User $user)
    {
        // Ensure new fields are returned when showing a single user
        $user->makeVisible(['is_enabled', 'is_confirmed', 'is_banned_from_comments']);
        return response()->json($user);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    { 
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,instructor,learner', 
            'password' => 'nullable|string|min:8',
            // Include validation for new status fields (optional on update)
            'is_enabled' => 'nullable|boolean',
            'is_confirmed' => 'nullable|boolean',
            'is_banned_from_comments' => 'nullable|boolean',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->role = $request->role;
        
        // Update new status fields if present in the request
        if ($request->has('is_enabled')) {
            $user->is_enabled = $request->is_enabled;
        }
        if ($request->has('is_confirmed')) {
            $user->is_confirmed = $request->is_confirmed;
        }
        if ($request->has('is_banned_from_comments')) {
            $user->is_banned_from_comments = $request->is_banned_from_comments;
        }

        if ($request->filled('password')) {
            // Fix: Changed request->passowrd to request->password
            $user->password = Hash::make($request->password); 
        }
        
        $user->save();
        return response()->json($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(null, 204);
    }

    /**
     * Toggles a specific boolean status field for a user.
     * This is the function required by the React frontend logic.
     */
    public function toggleUserField(Request $request, User $user)
    {
        $field = $request->input('field');

        // Validation to ensure only allowed fields can be toggled
        $request->validate([
            'field' => [
                'required',
                'string',
                // Rule::in ensures only these column names are accepted
                Rule::in(['is_enabled', 'is_confirmed', 'is_banned_from_comments']),
            ],
        ]);
        
        // Ensure the field exists on the model
        if (!isset($user->$field)) {
            return response()->json(['message' => 'Invalid status field specified.'], 400);
        }

        // Toggle the boolean value
        $user->$field = !$user->$field;
        $user->save();

        // Return the updated user object
        return response()->json($user);
    }
}