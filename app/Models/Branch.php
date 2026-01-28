<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'code', 'address', 'phone', 'email', 
        'is_main', 'is_active', 'settings'
    ];

    protected $casts = [
        'is_main' => 'boolean',
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function inventory(): HasMany
    {
        return $this->hasMany(BranchInventory::class);
    }
}
