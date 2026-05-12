<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TutorialCategoria extends Model
{
    protected $table = 'tutorial_categorias';

    protected $fillable = ['nombre', 'descripcion', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function tutoriales()
    {
        return $this->hasMany(Tutorial::class, 'categoria_id');
    }
}
