<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    protected $table = 'wallet';

    protected $fillable = [
        'user_id',
        'saldo'
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function transacciones()
    {
        return $this->hasMany(Transaccion::class, 'wallet_id');
    }
}
