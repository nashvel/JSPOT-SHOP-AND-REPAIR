<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'sku', 'barcode', 'price', 'image'];

    public function branches()
    {
        return $this->belongsToMany(Branch::class)->withPivot('stock_quantity');
    }
}
