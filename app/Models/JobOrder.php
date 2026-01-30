<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_code',
        'branch_id',
        'sale_id',
        'mechanic_id',
        'customer_name',
        'contact_number',
        'vehicle_details',
        'engine_number',
        'chassis_number',
        'plate_number',
        'description',
        'labor_cost',
        'parts_cost',
        'total_cost',
        'notes',
        'status',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'labor_cost' => 'decimal:2',
        'parts_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function mechanic(): BelongsTo
    {
        return $this->belongsTo(Mechanic::class);
    }

    public function parts(): HasMany
    {
        return $this->hasMany(JobOrderPart::class);
    }

    public static function generateTrackingCode(): string
    {
        $date = now()->format('Ymd');
        $lastJob = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastJob ? (int) substr($lastJob->tracking_code, -4) + 1 : 1;

        return sprintf('JO-%s-%04d', $date, $sequence);
    }
}
