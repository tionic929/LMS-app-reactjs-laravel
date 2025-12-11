<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL to modify the ENUM to include 'all'
        DB::statement("ALTER TABLE announcements MODIFY audience ENUM('learners','instructors','all') NOT NULL DEFAULT 'all'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original two options; default back to 'learners'
        DB::statement("ALTER TABLE announcements MODIFY audience ENUM('learners','instructors') NOT NULL DEFAULT 'learners'");
    }
};
