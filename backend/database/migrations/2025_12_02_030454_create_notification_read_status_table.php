<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the pivot table 'notification_read_status' to track user-specific
     * read status for each notification event.
     */
    public function up(): void
    {
        // CREATE the Per-User Read Status Pivot Table
        Schema::create('notification_read_status', function (Blueprint $table) {
            $table->id();

            // Link to the user who received/interacted with the notification
            $table->foreignId('user_id')
                  ->constrained('users') // Assumes 'users' table exists
                  ->onDelete('cascade');

            // Link to the actual notification event (must run after the notifications table migration)
            $table->foreignId('notification_id')
                  ->constrained('notifications')
                  ->onDelete('cascade');

            // Status tracking
            $table->boolean('is_read')->default(false)
                  ->comment('TRUE if the user has viewed this notification.');
            $table->timestamp('read_at')->nullable()
                  ->comment('Timestamp of when the user first read the notification.');

            $table->timestamps();

            // Ensures a user can only have one status record per notification
            $table->unique(['user_id', 'notification_id']);

            // Indexing for faster lookups (e.g., getting all unread for a user)
            $table->index(['user_id', 'is_read']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_read_status');
    }
};