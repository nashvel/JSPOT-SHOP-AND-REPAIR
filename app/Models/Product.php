<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['type', 'name', 'description', 'sku', 'barcode', 'price', 'image', 'category_id', 'cost'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function branches()
    {
        return $this->belongsToMany(Branch::class)->withPivot('stock_quantity');
    }

    public function isProduct(): bool
    {
        return $this->type === 'product';
    }

    public function isService(): bool
    {
        return $this->type === 'service';
    }

    /**
     * Get all sections this product is pinned to
     */
    public function sections()
    {
        return $this->belongsToMany(ProductSection::class, 'product_section_pins', 'product_id', 'section_id')
            ->withPivot('branch_id', 'order')
            ->withTimestamps();
    }

    /**
     * Get sections where this product is pinned for a specific branch
     */
    public function pinnedInSections($branchId = null)
    {
        $query = $this->belongsToMany(ProductSection::class, 'product_section_pins', 'product_id', 'section_id')
            ->withPivot('branch_id', 'order')
            ->withTimestamps();

        if ($branchId) {
            $query->where(function($q) use ($branchId) {
                $q->wherePivot('branch_id', $branchId)
                  ->orWherePivotNull('branch_id');
            });
        } else {
            $query->wherePivotNull('branch_id');
        }

        return $query;
    }
}
