<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'reservation_number',
        'customer_name',
        'customer_contact',
        'vehicle_engine',
        'vehicle_chassis',
        'vehicle_plate',
        'reservation_date',
        'issue_description',
        'notes',
        'status',
        'qr_token',
        'sale_id',
        'payment_method',
        'amount_paid',
        'change',
        'reference_number',
    ];

    protected $casts = [
        'reservation_date' => 'date',
        'amount_paid' => 'decimal:2',
        'change' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($reservation) {
            if (empty($reservation->qr_token)) {
                $reservation->qr_token = Str::random(32);
            }
        });
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function items()
    {
        return $this->hasMany(ReservationItem::class);
    }

    public function mechanics()
    {
        return $this->belongsToMany(Mechanic::class, 'mechanic_reservation');
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public static function generateReservationNumber($branchId)
    {
        $date = now()->format('Ymd');
        $count = self::where('branch_id', $branchId)
            ->whereDate('created_at', today())
            ->count() + 1;
        return "RES-{$branchId}-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
