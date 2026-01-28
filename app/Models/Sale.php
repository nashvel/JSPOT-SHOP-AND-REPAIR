<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_number',
        'branch_id',
        'user_id',
        'customer_name',
        'contact_number',
        'employee_name',
        'engine_number',
        'chassis_number',
        'plate_number',
        'subtotal',
        'total',
        'payment_method',
        'amount_paid',
        'change',
        'reference_number',
        'qr_token',
        'status',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change' => 'decimal:2',
    ];

    /**
     * Generate a unique sale number
     */
    public static function generateSaleNumber(): string
    {
        $date = now()->format('Ymd');
        $lastSale = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastSale ? (int) substr($lastSale->sale_number, -4) + 1 : 1;

        return sprintf('SO-%s-%04d', $date, $sequence);
    }

    /**
     * Generate unique QR token
     */
    public static function generateQrToken(): string
    {
        do {
            $token = bin2hex(random_bytes(32));
        } while (self::where('qr_token', $token)->exists());

        return $token;
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(SalesReturn::class);
    }
}
