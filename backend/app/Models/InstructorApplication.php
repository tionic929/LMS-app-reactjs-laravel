<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstructorApplication extends Model
{
    protected $table = 'instructor_applications';

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
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
