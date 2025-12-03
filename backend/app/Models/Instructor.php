<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Instructor extends Model
{
    protected $table = "instructor_applications";
    
    protected $fillable = [
        'user_id',
        // 'department',
        // 'specialization',
        'first_name',
        'middle_initial',
        'last_name',
        'date_of_birth',
        'phone_number',
        'address',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
