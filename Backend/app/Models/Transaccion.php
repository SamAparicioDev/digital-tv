<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaccion extends Model
{
    protected $table = 'transacciones';

    protected $casts = [
        'monto'          => 'float',
        'saldo_anterior' => 'float',
        'saldo_nuevo'    => 'float',
    ];

    protected $fillable = [
        'wallet_id',
        'metodo_pago_id',
        'referencia_pago',
        'comprobante_url',
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

    public function metodoPago()
    {
        return $this->belongsTo(MetodoPago::class);
    }

    // Devuelve la URL completa del comprobante (el path guardado en DB es relativo)
    public function getComprobanteUrlAttribute($value): ?string
    {
        if (!$value) return null;
        if (filter_var($value, FILTER_VALIDATE_URL)) return $value;
        return url("storage/{$value}");
    }
}
