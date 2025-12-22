<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

    /**
     * Get the avatar URL.
     * Logic: If it's a full URL (from seeder), return it.
     * If it's a local path (uploaded), return the storage URL.
     */
    public function getAvatarUrlAttribute()
    {
        if (!$this->avatar) {
            return null;
        }

        // 1. Check if the avatar is an external URL (starts with http or https)
        if (Str::startsWith($this->avatar, ['http://', 'https://'])) {
            return $this->avatar;
        }

        // 2. Otherwise, treat it as a local file in storage
        // This generates: http://localhost:8000/storage/avatars/image.jpg
        return asset(Storage::url($this->avatar));
    }

    // Relationships
    public function admin()
    {
        return $this->hasOne(Admin::class);
    }

    public function application()
    {
        return $this->hasOne(InstructorApplication::class);
    }

    public function instructor()
    {
        return $this->hasOne(InstructorProfile::class);
    }

    public function learner()
    {
        return $this->hasOne(Learner::class);   
    }

    public function isRole($role)
    {
        return $this->role === $role;
    }

    public function notifications()
    {
        // Added missing import or used fully qualified name if needed
        return $this->hasMany(Notification::class)->latest();
    }
}