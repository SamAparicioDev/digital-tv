<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsToMany; // 👈 Asegúrate de importar esta clase

class Rol extends Model
{
    use HasFactory;

    // Configuración para UUID
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'rol';

    protected $fillable = [
        'nombre',
        'descripcion'
    ];

    // --- Relaciones Existentes ---

    public function privilegios(): BelongsToMany
    {
        return $this->belongsToMany(Privilegio::class, 'privilegio_rol', 'rol_id', 'privilegio_id');
    }

    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'usuario_rol');
    }

    // --- Nueva Relación de Descuentos ---

    /**
     * Define la relación muchos a muchos con los descuentos.
     * La clave foránea local es 'role_id' (UUID), que enlaza a 'descuento_rol'.
     */
    public function descuentos(): BelongsToMany
    {
        return $this->belongsToMany(
            Descuento::class,
            'descuento_rol', // Nombre de la tabla pivote
            'role_id',       // Clave foránea LOCAL (en la pivote) que apunta a este modelo (Rol.id)
            'descuento_id'   // Clave foránea REMOTA (en la pivote) que apunta al modelo Descuento
        )->withPivot([
            'valor_descuento',
            'tipo_descuento',
            'is_active'
        ])->withTimestamps();
    }

    // --- Booting para asignación automática de UUID ---

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
