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
        Schema::table('course_comments', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->after('user_id')->constrained('course_comments')->onDelete('cascade');
            $table->foreignId('reply_to_user_id')->nullable()->after('parent_id')->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_comments', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropForeign(['reply_to_user_id']);
            $table->dropColumn(['parent_id', 'reply_to_user_id']);
        });
    }
};
