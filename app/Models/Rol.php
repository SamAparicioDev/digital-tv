<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Rol extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'rol';

    protected $fillable = [
        'nombre',
        'descripcion'
    ];

    // --- Relaciones ---

    public function usuarios(): BelongsToMany
    {
        // 🚨 CORRECCIÓN INVERSA APLICADA:
        // 1. Tabla pivote: 'usuario_rol'
        // 2. Clave foránea de ESTE modelo (Rol) en la pivote: 'rol_id'
        // 3. Clave foránea del OTRO modelo (User) en la pivote: 'usuario_id'
        return $this->belongsToMany(User::class, 'usuario_rol', 'rol_id', 'usuario_id');
    }

    public function privilegios(): BelongsToMany
    {
        return $this->belongsToMany(Privilegio::class, 'privilegio_rol', 'rol_id', 'privilegio_id')
                    ->withTimestamps();
    }

    public function descuentos(): BelongsToMany
    {
        // Nota: En la migración 'descuento_rol' definimos la columna como 'role_id' (con 'e'),
        // así que debemos usar ese nombre aquí.
        return $this->belongsToMany(
            Descuento::class,
            'descuento_rol',
            'role_id',      // Clave foránea de Rol en la pivote
            'descuento_id'  // Clave foránea de Descuento en la pivote
        )->withPivot([
            'valor_descuento',
            'tipo_descuento',
            'is_active'
        ])->withTimestamps();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
        });
    }
}
