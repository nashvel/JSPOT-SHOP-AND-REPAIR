<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'branch_id',
        'attendable_id',
        'attendable_type',
        'date',
        'status',
        'time_in',
        'time_out',
        'remarks',
    ];

    protected $casts = [
        'date' => 'date',
        // 'time_in' => 'datetime', // Time casting might be tricky, usually string is fine for simple time, or custom cast. Keeping as default/string for now or 'datetime:H:i' if full timestamp.
        // Simple 'time' columns often work best as strings in Laravel unless paired with date.
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function attendable()
    {
        return $this->morphTo();
    }
}
