<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class StreamingService extends Model
{
    use HasFactory;

    protected $table = 'streaming_services';

    protected $fillable = [
        'name',
        'slug',
        'logo_url',
        'primary_color',
        'cantidad_cuentas', // 👈 Nuevo campo agregado
        'is_active'
    ];

    protected $casts = [
        'cantidad_cuentas' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Relación Muchos a Muchos: Un servicio puede estar presente en muchas ofertas.
     */
    public function ofertas(): BelongsToMany
    {
        return $this->belongsToMany(
            Oferta::class,
            'oferta_servicio',       // Tabla pivote
            'streaming_service_id',  // Clave foránea local (en el pivote)
            'oferta_id'              // Clave foránea remota (en el pivote)
        )->withPivot([
            'numero_perfiles',
            'duracion_dias',
            'is_active'
        ])
        ->withTimestamps();
    }
}
