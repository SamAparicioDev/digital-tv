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
        'cantidad_cuentas',
        'is_active'
    ];

    protected $casts = [
        'cantidad_cuentas' => 'integer',
        'is_active' => 'boolean',
    ];

    public function ofertas(): BelongsToMany
    {
        return $this->belongsToMany(
            Oferta::class,
            'oferta_servicio',
            'streaming_service_id',
            'oferta_id'
        )->withPivot([
            'numero_perfiles',
            'duracion_dias',
            'is_active'
        ])
        ->withTimestamps();
    }
}
