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
        Schema::table('learners', function (Blueprint $table) {
            // Personal Information
            $table->string('first_name')->after('user_id')->nullable();
            $table->char('middle_initial', 2)->after('first_name')->nullable();
            $table->string('last_name')->after('middle_initial')->nullable();
            $table->date('date_of_birth')->after('last_name')->nullable();
            
            // Contact Information
            $table->string('phone_number', 20)->after('date_of_birth')->nullable();
            $table->text('address')->after('phone_number')->nullable();
            
            // Optional: Student ID or other institutional identifier
            // We'll place this before the standard timestamps
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('learners', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'middle_initial',
                'last_name',
                'date_of_birth',
                'phone_number',
                'address',
            ]);
        });
    }
};