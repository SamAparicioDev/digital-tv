<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetodoPago extends Model
{
    protected $table = 'metodos_pago';

    protected $fillable = ['nombre', 'tipo', 'emoji', 'color', 'is_active'];

    public function numeroCuentas()
    {
        return $this->belongsToMany(NumeroCuenta::class, 'metodo_pago_numero_cuenta');
    }

    public function transacciones()
    {
        return $this->hasMany(Transaccion::class);
    }
}
