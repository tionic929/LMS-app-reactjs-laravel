<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Learner extends Model
{
    protected $fillable = [
        'user_id',
        'first_name',
        'middle_initial',
        'last_name',
        'date_of_birth',
        'phone_number',
        'address',
        'grade_level',
        'section',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
