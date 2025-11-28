<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Wallet extends Model
{
    protected $table = 'wallet';

    protected $fillable = [
        'user_id',
        'saldo' // lo manejaremos virtualmente
    ];

    protected $hidden = [
        'saldo_cents'
    ];

    // Mutator
    public function setSaldoAttribute($value)
    {
        $this->attributes['saldo_cents'] = (int) round($value * 100);
    }

    // Accessor
    public function getSaldoAttribute()
    {
        return $this->attributes['saldo_cents'] / 100;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

