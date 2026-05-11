<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CuentaStreaming extends Model
{
    protected $table = 'cuentas_streaming';

    protected $fillable = [
        'streaming_service_id', 'email', 'password',
        'descripcion', 'vigencia_hasta', 'is_active',
    ];

    public function streamingService()
    {
        return $this->belongsTo(StreamingService::class);
    }

    public function perfiles()
    {
        return $this->hasMany(PerfilStreaming::class, 'cuenta_id');
    }

    /** Relación para cuando la cuenta completa fue asignada a una compra */
    public function credencial()
    {
        return $this->hasOne(CompraCredencial::class, 'cuenta_id')->whereNull('perfil_id');
    }

    /** Perfiles que aún no han sido asignados a ninguna compra */
    public function perfilesDisponibles()
    {
        return $this->perfiles()
            ->where('is_active', true)
            ->whereDoesntHave('credencial');
    }
}
