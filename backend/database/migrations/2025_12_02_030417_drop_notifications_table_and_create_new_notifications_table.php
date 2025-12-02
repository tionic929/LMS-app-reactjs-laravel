<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Drops any existing 'notifications' table and creates the new polymorphic
     * 'notifications' table for notification events.
     */
    public function up(): void
    {
        // 1. SAFELY DROP the old 'notifications' table if it exists.
        Schema::dropIfExists('notifications');

        // 2. CREATE the new 'notifications' table (The Central Event Log)
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();

            // Polymorphic relation to define the target entity (Room/Role/User)
            // Creates 'notifiable_type' and 'notifiable_id' columns.
            $table->morphs('notifiable');

            // Notification Content
            $table->text('message')->comment('The main content/body of the notification.');
            $table->string('type', 50)->comment('Categorical type (e.g., grade_update, admin_announcement).');
            $table->string('link_url')->nullable()->comment('Optional URL for navigation.');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * Drops the new table, but does not recreate the old one.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};