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

    /**
     * Define la relación muchos a muchos con los roles.
     */
    public function roles(): BelongsToMany
    {
        // El tercer argumento es el nombre de la tabla pivote, y el cuarto y quinto son
        // los nombres de las claves foráneas en esa tabla.
        return $this->belongsToMany(
            Rol::class,
            'descuento_rol', // Nombre de la tabla pivote
            'descuento_id',  // Clave foránea local en la tabla pivote
            'role_id'        // Clave foránea remota en la tabla pivote
        )->withPivot([
            'valor_descuento',
            'tipo_descuento',
            'is_active'
        ])->withTimestamps();
    }
}
