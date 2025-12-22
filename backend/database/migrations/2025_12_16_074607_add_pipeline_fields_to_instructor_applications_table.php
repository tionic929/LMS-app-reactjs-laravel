<?php
// Example Migration (database/migrations/xxxx_add_pipeline_fields_to_instructor_applications_table.php)

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('instructor_applications', function (Blueprint $table) {
            // 1. Status Tracking (The core of the pipeline)
            $table->enum('status', ['pending', 'under_review', 'assessment', 'approved', 'rejected', 'withdrawn'])
                  ->default('pending')->change(); // Modify if status already exists

            // 2. Time Tracking (For efficiency metrics)
            $table->timestamp('review_started_at')->nullable();
            $table->timestamp('assessment_completed_at')->nullable();
            $table->timestamp('final_decision_at')->nullable(); // Set upon approved/rejected/withdrawn

            // 3. Rejection/Feedback Data
            $table->text('reviewer_feedback')->nullable();
            $table->string('rejection_reason')->nullable(); // If status is 'rejected'
        });
    }

    public function down(): void
    {
        Schema::table('instructor_applications', function (Blueprint $table) {
            $table->dropColumn(['review_started_at', 'assessment_completed_at', 'final_decision_at', 'reviewer_feedback', 'rejection_reason']);
            // Note: Reverting the enum change is complex; typically you drop the table or redefine the column entirely.
        });
    }
};