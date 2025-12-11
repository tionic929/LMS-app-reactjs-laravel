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
        'parent_id',
        'reply_to_user_id',
        'content',
    ];

    protected $appends = [
        'upvotes_count',
        'downvotes_count',
        'user_vote',
        'replies_count',
        'is_nested_reply',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(CourseComment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(CourseComment::class, 'parent_id')->with('user', 'replyToUser');
    }

    public function replyToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reply_to_user_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(CommentVote::class, 'course_comment_id');
    }

    public function getUpvotesCountAttribute(): int
    {
        return $this->votes()->where('vote_type', 'upvote')->count();
    }

    public function getDownvotesCountAttribute(): int
    {
        return $this->votes()->where('vote_type', 'downvote')->count();
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

        return $vote->vote_type;
    }

    public function getRepliesCountAttribute(): int
    {
        return $this->replies()->count();
    }

    public function getIsNestedReplyAttribute(): bool
    {
        if (!$this->parent_id) {
            return false; // This is a top-level comment
        }

        // Check if the parent comment itself has a parent (making this a nested reply)
        // Use a direct query instead of relying on loaded relationship
        return static::where('id', $this->parent_id)->whereNotNull('parent_id')->exists();
    }
}
