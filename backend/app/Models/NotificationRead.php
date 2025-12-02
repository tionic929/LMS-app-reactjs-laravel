<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationRead extends Model
{
    protected $table = 'notification_read_status';

    protected $fillable = [
        'user_id',
        'notification_id',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean'
    ];

    public function notification()
    {
        return $this->belongsTo(Notification::class, 'notification_id');
    }
}
