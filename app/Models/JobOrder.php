<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobOrder extends Model
{
    use HasFactory;

    protected $fillable = ['tracking_code', 'branch_id', 'customer_name', 'vehicle_details', 'description', 'status'];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
