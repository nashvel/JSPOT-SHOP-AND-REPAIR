<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'email', 'phone', 'address', 'customer_code',
        'credit_limit', 'current_balance', 'custom_fields'
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'custom_fields' => 'array',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
