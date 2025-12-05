<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute()
    {
        if (!$this->avatar) {
            return null;
        }
        // Return absolute URL so frontend can load across origins
        $relative = \Illuminate\Support\Facades\Storage::url($this->avatar); // e.g. /storage/avatars/xyz.jpg
        return url($relative);
    }

    // Relationships
    public function admin()
    {
        return $this->hasOne(Admin::class);
    }

    public function instructor()
    {
        return $this->hasOne(Instructor::class);
    }

    public function learner()
    {
        return $this->hasOne(Learner::class);
    }

    public function isRole($role)
    {
        return $this->role === $role;
    }
}
