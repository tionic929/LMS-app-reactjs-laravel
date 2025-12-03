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
            $table->unsignedBigInteger('parent_comment_id')->nullable()->after('course_id');
            $table->foreign('parent_comment_id')->references('id')->on('course_comments')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_comments', function (Blueprint $table) {
            //
        });
    }
};
