<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'type',
        'audience',
        'created_by',
        'event_date',
        'event_time',
        'location',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
