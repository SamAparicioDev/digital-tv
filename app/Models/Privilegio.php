<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Rol;
use Illuminate\Support\Str;
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

    public function roles()
    {
        return $this->belongsToMany(Rol::class);
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
