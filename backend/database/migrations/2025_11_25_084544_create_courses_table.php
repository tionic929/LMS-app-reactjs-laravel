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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content')->nullable();
            $table->string('author');
            $table->enum('privacy', ['public', 'private'])->default('public');
            $table->integer('currentEnrolled')->default(0);
            $table->integer('capacity')->default(0);
            // $table->enum('status', ['active', 'disbanded'])->default('active');
            // $table->boolean('requireApproval')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
