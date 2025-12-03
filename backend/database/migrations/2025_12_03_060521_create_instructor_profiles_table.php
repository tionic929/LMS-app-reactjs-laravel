<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('instructor_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('first_name')->nullable();
            $table->string('middle_initial')->nullable();
            $table->string('last_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('address')->nullable();
            $table->text('bio')->nullable();
            $table->string('experience')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_profiles');
    }
};

