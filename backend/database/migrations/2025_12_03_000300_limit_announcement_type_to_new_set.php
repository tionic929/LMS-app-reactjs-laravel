<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Normalize existing legacy types to 'general' before restricting enum
        DB::statement("UPDATE announcements SET `type` = 'general' WHERE `type` IN ('info','warning','success','error','maintenance')");
        // Limit enum to the new set only
        DB::statement(
            "ALTER TABLE announcements MODIFY `type` ENUM('news','event','general') NOT NULL DEFAULT 'general'"
        );
    }

    public function down(): void
    {
        // Revert to previous extended set (if needed)
        DB::statement(
            "ALTER TABLE announcements MODIFY `type` ENUM('info','warning','success','error','maintenance','news','event','general') NOT NULL DEFAULT 'info'"
        );
    }
};
