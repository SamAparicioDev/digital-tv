<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Privilegio extends Model
{
    // Configuración para UUID
    public $incrementing = false;
    public $keyType = 'string';
    protected $table = 'privilegios';

    protected $fillable = [
        'nombre',
        'acceso',
        'descripcion'
    ];

    /**
     * Define la relación muchos a muchos con los roles.
     * La tabla pivote es 'privilegio_rol'.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            Rol::class,
            'privilegio_rol',
            'privilegio_id',
            'rol_id'
        )->withTimestamps(); // 🚨 CLAVE: Añadir esto aquí
    }

    // Booting para asignación automática de UUID
    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
        });
    }
}
