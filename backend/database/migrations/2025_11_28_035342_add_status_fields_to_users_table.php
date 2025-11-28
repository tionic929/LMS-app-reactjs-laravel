<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Field 1: General Account Status (Learners & Instructors)
            // Default: true (Account is enabled upon creation)
            $table->boolean('is_enabled')->default(true)->after('password');
            
            // Field 2: Instructor Confirmation Status (For Instructors only)
            // Default: false (Requires manual confirmation by an Admin)
            $table->boolean('is_confirmed')->default(false)->after('is_enabled');

            // Field 3: Comments Ban Status (Learners & Instructors)
            // Default: false (User is not banned from commenting)
            $table->boolean('is_banned_from_comments')->default(false)->after('is_confirmed');
            
            // OPTIONAL: Add an index for faster filtering by role, as discussed previously
            $table->index('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Remove the new columns if the migration is rolled back
            $table->dropColumn(['is_enabled', 'is_confirmed', 'is_banned_from_comments']);
            
            // OPTIONAL: Remove the index
            $table->dropIndex(['role']);
        });
    }
};