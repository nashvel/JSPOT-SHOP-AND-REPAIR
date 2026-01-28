<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = ['branch_id', 'customer_name', 'customer_contact', 'items', 'status'];

    protected $casts = [
        'items' => 'array',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
