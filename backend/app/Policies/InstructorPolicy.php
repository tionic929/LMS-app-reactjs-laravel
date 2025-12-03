<?php

namespace App\Policies;

use App\Models\InstructorApplication;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class InstructorPolicy
{

    public function accessInstructorArea(User $user): Response
    {
        // 1. Basic check: Must have the 'instructor' role flag.
        if ($user->role !== 'instructor') {
            return Response::deny('You do not have the instructor role.');
        }

        // 2. Workflow check: Application status must be 'approved'.
        // We check the 'application' relationship to the instructor_applications table.
        if (!$user->application || $user->application->status !== 'approved') {
            return Response::deny('Your instructor application is still pending review.');
        }

        // If both checks pass, grant access.
        return Response::allow();
    }
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, InstructorApplication $instructorApplication): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, InstructorApplication $instructorApplication): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, InstructorApplication $instructorApplication): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, InstructorApplication $instructorApplication): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, InstructorApplication $instructorApplication): bool
    {
        return false;
    }
}
