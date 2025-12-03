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
        DB::statement(
            "ALTER TABLE announcements MODIFY `type` ENUM('info','warning','success','error','maintenance','news','event','general') NOT NULL DEFAULT 'info'"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement(
            "ALTER TABLE announcements MODIFY `type` ENUM('info','warning','success','error','maintenance') NOT NULL DEFAULT 'info'"
        );
    }
};
