<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstructorProfile extends Model
{
    protected $table = 'instructor_profiles';

    protected $fillable = [
        'user_id',
        'first_name',
        'middle_initial',
        'last_name',
        'date_of_birth',
        'phone_number',
        'address',
        'bio',
        'experience',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
