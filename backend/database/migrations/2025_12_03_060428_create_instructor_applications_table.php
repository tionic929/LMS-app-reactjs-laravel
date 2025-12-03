<?php

// database/migrations/2025_xx_xx_create_instructor_applications_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('instructor_applications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('first_name');
            $table->string('middle_initial')->nullable();
            $table->string('last_name');
            $table->date('date_of_birth')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('address')->nullable();
            $table->text('bio')->nullable();            // optional
            $table->string('experience')->nullable();   // optional
            $table->enum('status', ['pending','approved','rejected'])->default('pending');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_applications');
    }
};
