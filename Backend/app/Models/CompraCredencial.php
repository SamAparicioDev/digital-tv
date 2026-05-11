<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompraCredencial extends Model
{
    protected $table = 'compra_credencial';

    protected $fillable = [
        'compra_id', 'user_id', 'cuenta_id', 'perfil_id',
        'vigencia_desde', 'vigencia_hasta',
    ];

    public function compra()
    {
        return $this->belongsTo(Compra::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cuenta()
    {
        return $this->belongsTo(CuentaStreaming::class, 'cuenta_id');
    }

    public function perfil()
    {
        return $this->belongsTo(PerfilStreaming::class, 'perfil_id');
    }
}
