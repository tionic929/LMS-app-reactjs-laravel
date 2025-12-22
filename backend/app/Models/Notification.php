<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'notifications';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'notifiable_type',
        'notifiable_id',
        'message',
        'type',
        'link_url',
        'activity_log_id',
    ];

    public function activityLog()
    {
        return $this->belongsTo(ActivityLog::class);
    }

    // The user who performed the activity
    public function user()
    {
        // Through the activity log
        return $this->hasOneThrough(
            User::class,       // The final model we want
            ActivityLog::class, // The intermediate model
            'id',              // ActivityLog's key that Notification points to
            'id',              // User's primary key
            'activity_log_id', // Notification's foreign key to ActivityLog
            'user_id'          // ActivityLog's foreign key to User
        );
    }

    

    // ... other model definitions (relationships, etc.)
}