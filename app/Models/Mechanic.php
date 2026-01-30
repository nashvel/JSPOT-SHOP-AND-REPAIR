<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mechanic extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'date_of_birth',
        'hire_date',
        'emergency_contact_name',
        'emergency_contact_phone',
        'specialization',
        'total_labor_earned',
        'branch_id',
        'is_active',
        'photo',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'date_of_birth' => 'date',
        'hire_date' => 'date',
        'total_labor_earned' => 'decimal:2',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function jobOrders(): HasMany
    {
        return $this->hasMany(JobOrder::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function addLaborEarnings(float $amount): void
    {
        $this->increment('total_labor_earned', $amount);
    }

    public function attendances(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Attendance::class, 'attendable');
    }
}
