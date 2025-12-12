<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_verification_codes', function (Blueprint $table) {
            $table->id();
            $table->string('email');       // Email of the user
            $table->string('token');       // 6-digit code
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_verification_codes');
    }
};
