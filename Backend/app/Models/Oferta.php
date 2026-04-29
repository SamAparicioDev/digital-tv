<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Oferta extends Model
{
    use HasFactory;

    protected $table = 'ofertas';

    protected $fillable = [
        'garantia_dias',
        'precio',
        'cuenta_completa',
        'is_active',
        'stock' 
    ];

    protected $casts = [
        'garantia_dias' => 'integer',
        'precio' => 'float',
        'cuenta_completa' => 'boolean',
        'is_active' => 'boolean',
        'stock' => 'integer'
    ];

    public function servicios(): BelongsToMany
    {
        return $this->belongsToMany(
            StreamingService::class,
            'oferta_servicio',
            'oferta_id',
            'streaming_service_id'
        )->withPivot([
            'numero_perfiles',
            'duracion_dias',
            'is_active'
        ])->withTimestamps();
    }
}
