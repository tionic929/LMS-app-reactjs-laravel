<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Course extends Model
{
    /** @use HasFactory<\Database\Factories\CourseFactory> */
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'title',
        'content',
        'privacy',
        'capacity',
        'current_enrolled',
        'status',
    ];

    protected $casts = [
        'current_enrolled' => 'integer',
        'capacity' => 'integer',
    ];

    protected $appends = ['instructor_name'];

    /**
     * Get the instructor that owns the course.
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * Get the enrolled learners.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    /**
     * Get active enrolled learners.
     */
    public function activeLearners(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_enrollments')
            ->wherePivot('status', 'active')
            ->withPivot('status', 'created_at', 'comment_banned')
            ->withTimestamps();
    }

    /**
     * Get pending join requests.
     */
    public function joinRequests(): HasMany
    {
        return $this->hasMany(CourseJoinRequest::class)->where('status', 'pending');
    }

    /**
     * Get all materials for this course.
     */
    public function materials(): HasMany
    {
        return $this->hasMany(CourseMaterial::class);
    }

    /**
     * Get all comments for this course.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(CourseComment::class);
    }

    /**
     * Get all announcements for this course.
     */
    public function announcements(): HasMany
    {
        return $this->hasMany(CourseAnnouncement::class);
    }

    /**
     * Get instructor name accessor
     */
    public function getInstructorNameAttribute(): string
    {
        return $this->instructor ? $this->instructor->name : 'Unknown';
    }
}
