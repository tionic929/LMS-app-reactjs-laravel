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
        Schema::table('instructors', function (Blueprint $table) {
            $table->dropColumn([
                'specialization',
                'department',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructors', function (Blueprint $table) {
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
