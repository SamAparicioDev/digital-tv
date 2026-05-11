<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Descuento extends Model
{
    use HasFactory;

    protected $table = 'descuentos';

    protected $fillable = [
        'codigo', 'nombre', 'descripcion',
        'fecha_inicio', 'fecha_fin',
        'es_recurrente', 'is_active',
        'streaming_service_id',
        'valor_global', 'tipo_global',
    ];

    protected $casts = [
        'fecha_inicio'  => 'datetime',
        'fecha_fin'     => 'datetime',
        'es_recurrente' => 'boolean',
        'is_active'     => 'boolean',
        'valor_global'  => 'float',
    ];

    public function streamingService()
    {
        return $this->belongsTo(StreamingService::class);
    }

    /** Múltiples servicios de streaming asociados al descuento */
    public function streamingServices(): BelongsToMany
    {
        return $this->belongsToMany(
            StreamingService::class,
            'descuento_streaming_service',
            'descuento_id',
            'streaming_service_id'
        );
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            Rol::class,
            'descuento_rol', 
            'descuento_id',
            'role_id'
        )->withPivot([
            'valor_descuento',
            'tipo_descuento',
            'is_active'
        ])->withTimestamps();
    }
}
