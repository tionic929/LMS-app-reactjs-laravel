<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'user_id',
        'content',
        'parent_comment_id',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function replies()
    {
        return $this->hasMany(CourseComment::class, 'parent_comment_id')->with(['user', 'replies']);
    }

    public function parent()
    {
        return $this->belongsTo(CourseComment::class, 'parent_comment_id');
    }
}
