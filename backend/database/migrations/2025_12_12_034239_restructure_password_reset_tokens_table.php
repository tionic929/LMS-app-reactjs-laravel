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
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            // 1. REMOVE: Drop the existing primary key on the 'email' column.
            // This must be done before defining the new primary key.
            // Note: Laravel's default structure uses ->primary() on email, which also makes it unique.
            $table->dropPrimary();

            // 2. ADD: Create the auto-incrementing 'id' column.
            // The ->first() method ensures it is the first column in the table.
            // This column is automatically set as the primary key by $table->id().
            $table->id()->first();

            // 3. MODIFY: Add a non-unique index to the 'email' column for fast lookups.
            // Since we dropped the primary key (which was unique), we now have a standard, non-unique column.
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations (Rollback).
     */
    public function down(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            // 1. REVERSE MODIFY: Remove the standard index on 'email'.
            $table->dropIndex(['email']);

            // 2. REVERSE ADD: Drop the primary key constraint on 'id'.
            // The constraint name is often auto-generated, but dropPrimary() is safest.
            $table->dropPrimary(); 

            // 3. REVERSE ADD: Drop the 'id' column.
            $table->dropColumn('id');

            // 4. REVERSE REMOVE: Restore the 'email' column as the primary key.
            // This also restores its unique constraint.
            $table->primary('email');
        });
    }
};