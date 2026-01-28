<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BranchInventory extends Model
{
    protected $table = 'branch_inventory';

    protected $fillable = [
        'branch_id', 'product_id', 'quantity', 'reserved_quantity'
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getAvailableQuantityAttribute(): int
    {
        return $this->quantity - $this->reserved_quantity;
    }
}
