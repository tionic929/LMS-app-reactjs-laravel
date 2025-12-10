<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'user_id',
        'content',
    ];

    protected $appends = [
        'upvotes_count',
        'downvotes_count',
        'user_vote',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(CommentVote::class, 'comment_id');
    }

    public function getUpvotesCountAttribute(): int
    {
        return $this->votes()->where('vote', 1)->count();
    }

    public function getDownvotesCountAttribute(): int
    {
        return $this->votes()->where('vote', -1)->count();
    }

    public function getUserVoteAttribute(): ?string
    {
        if (!auth()->check()) {
            return null;
        }

        $vote = $this->votes()
            ->where('user_id', auth()->id())
            ->first();

        if (!$vote) {
            return null;
        }

        return $vote->vote === 1 ? 'upvote' : ($vote->vote === -1 ? 'downvote' : null);
    }
}
