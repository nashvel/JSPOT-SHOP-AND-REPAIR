<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSection extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'order'];

    /**
     * Get all products pinned to this section
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_section_pins', 'section_id', 'product_id')
            ->withPivot('branch_id', 'order')
            ->withTimestamps()
            ->orderBy('product_section_pins.order');
    }

    /**
     * Get pinned products for a specific branch
     */
    public function pinnedProducts($branchId = null)
    {
        $query = $this->belongsToMany(Product::class, 'product_section_pins', 'section_id', 'product_id')
            ->withPivot('branch_id', 'order')
            ->withTimestamps()
            ->orderBy('product_section_pins.order');

        if ($branchId) {
            $query->wherePivot('branch_id', $branchId)
                  ->orWherePivotNull('branch_id');
        } else {
            $query->wherePivotNull('branch_id');
        }

        return $query;
    }
}
