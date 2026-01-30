<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'address', 'contact_number', 'is_main', 'latitude', 'longitude', 'user_id'];

    protected $casts = [
        'is_main' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)->withPivot('stock_quantity');
    }

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
