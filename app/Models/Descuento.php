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
        'codigo',
        'nombre',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'es_recurrente',
        'is_active',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'es_recurrente' => 'boolean',
        'is_active' => 'boolean',
    ];

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
