<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role')
                ->orderBy('id', 'asc')
                ->paginate(10);
        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function getPaginatedUsers(Request $request)
    {
        $search = $request->query('search');
        $role = $request->query('role');

        $query = User::select('id', 'name', 'email', 'role')->orderBy('id', 'asc');

        // Apply Search Filter (Name, Email, or ID)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                ->orWhere('email', 'LIKE', "%{$search}%")
                ->orWhere('id', $search);
            });
        }

        // Apply Role Filter
        if ($role && $role !== 'all') {
            $query->where('role', $role);
        }

        return response()->json($query->paginate(5));
    }
    
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = new User;
        $user->name = $request->name;
        $user->email = $request->email;
        $user->password = Hash::make($request->password);
        $user->role = $request->role;
        $user->save();
        return response()->json($user);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, User $user)
    {
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
            'email' => 'required|email|max:255|unique:users,email,' . $user->id, // Use $user->id here
            'role' => 'required|in:admin,instructor,learner', 
            'password' => 'nullable|string|min:8',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->role = $request->role;
        if($request->filled('password')){
            $user->password = Hash::make($request->passowrd);
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
        return response()->json($user);
    }
}
