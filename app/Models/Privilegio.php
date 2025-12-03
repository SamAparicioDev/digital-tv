<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Privilegio extends Model
{
    public $incrementing = false;
    public $keyType = 'string';
    protected $table = 'privilegios';

    protected $fillable = [
        'nombre',
        'acceso',
        'descripcion'
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            Rol::class,
            'privilegio_rol',
            'privilegio_id',
            'rol_id'
        )->withTimestamps();
    }

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
