<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'sku', 'barcode', 'description', 'category_id',
        'price', 'cost', 'stock_quantity', 'min_stock_level',
        'unit', 'images', 'is_active', 'track_inventory', 'custom_fields'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'is_active' => 'boolean',
        'track_inventory' => 'boolean',
        'images' => 'array',
        'custom_fields' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function branchInventory(): HasMany
    {
        return $this->hasMany(BranchInventory::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
