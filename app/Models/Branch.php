<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'email', 'password', 'address', 'contact_number', 'is_main', 'latitude', 'longitude'];

    protected $hidden = ['password'];

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

    // Alias for users - staff belongs to this branch
    public function staff()
    {
        return $this->hasMany(User::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)->withPivot('stock_quantity');
    }

    // Menus assigned to this branch
    public function menus()
    {
        return $this->belongsToMany(Menu::class, 'menu_branch')->orderBy('order');
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

