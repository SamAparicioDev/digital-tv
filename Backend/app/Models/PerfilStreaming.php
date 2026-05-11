<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerfilStreaming extends Model
{
    protected $table = 'perfiles_streaming';

    protected $fillable = ['cuenta_id', 'nombre', 'pin', 'is_active'];

    public function cuenta()
    {
        return $this->belongsTo(CuentaStreaming::class, 'cuenta_id');
    }

    public function credencial()
    {
        return $this->hasOne(CompraCredencial::class, 'perfil_id');
    }

    public function isDisponible(): bool
    {
        return $this->is_active && !$this->credencial()->exists();
    }
}
