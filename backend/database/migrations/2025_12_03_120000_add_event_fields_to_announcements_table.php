<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (!Schema::hasColumn('announcements', 'event_date')) {
                $table->date('event_date')->nullable()->after('type');
            }
            if (!Schema::hasColumn('announcements', 'event_time')) {
                $table->string('event_time', 32)->nullable()->after('event_date');
            }
            if (!Schema::hasColumn('announcements', 'location')) {
                $table->string('location', 255)->nullable()->after('event_time');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (Schema::hasColumn('announcements', 'location')) {
                $table->dropColumn('location');
            }
            if (Schema::hasColumn('announcements', 'event_time')) {
                $table->dropColumn('event_time');
            }
            if (Schema::hasColumn('announcements', 'event_date')) {
                $table->dropColumn('event_date');
            }
        });
    }
};
