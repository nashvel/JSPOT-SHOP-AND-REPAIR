<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    /** @use HasFactory<\Database\Factories\AreaFactory> */
    use HasFactory;

    protected $fillable = ['application_id', 'name', 'assigned_user_id', 'description'];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}
