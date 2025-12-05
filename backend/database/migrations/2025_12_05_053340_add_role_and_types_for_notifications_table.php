<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Add a role column to support role-based notifications
            $table->string('role')->nullable()->after('type')->comment('Role for role-based notifications, e.g. student, instructor');

            // Optional: Ensure type can still be used for private/public or category
            $table->string('type')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('role');

            // Optional: revert type column change
            $table->string('type')->change();
        });
    }
};
