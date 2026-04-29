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

    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'usuario_rol', 'rol_id', 'usuario_id');
    }

    public function privilegios(): BelongsToMany
    {
        return $this->belongsToMany(Privilegio::class, 'privilegio_rol', 'rol_id', 'privilegio_id')
                    ->withTimestamps();
    }

    public function descuentos(): BelongsToMany
    {
        return $this->belongsToMany(
            Descuento::class,
            'descuento_rol',
            'role_id',
            'descuento_id'
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
