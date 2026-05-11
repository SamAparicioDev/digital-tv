<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NumeroCuenta extends Model
{
    protected $table = 'numero_cuentas';

    protected $fillable = ['numero', 'descripcion', 'is_active'];

    public function metodosPago()
    {
        return $this->belongsToMany(MetodoPago::class, 'metodo_pago_numero_cuenta');
    }
}
