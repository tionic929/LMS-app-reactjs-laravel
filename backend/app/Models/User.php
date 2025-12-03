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
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

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

    public function notifications(): hasMany
    {
        return $this->hasMany(Notification::class)->latest();
    }
}
