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
        'referencia_pago',
        'descripcion'
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }
}
