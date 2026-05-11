<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaccion extends Model
{
    protected $table = 'transacciones';

    protected $fillable = [
        'wallet_id',
        'tipo',
        'monto',
        'saldo_anterior',
        'saldo_nuevo',
        'descripcion',
        'estado',
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function compra()
    {
        return $this->hasOne(Compra::class);
    }
}
