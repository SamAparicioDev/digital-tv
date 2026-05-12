<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Estreno extends Model
{
    protected $table = 'estrenos';

    protected $fillable = ['titulo', 'formato', 'imagen', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    protected $appends = ['imagen_url'];

    public function streamingServices()
    {
        return $this->belongsToMany(StreamingService::class, 'estreno_streaming_service');
    }

    /** Devuelve URL absoluta de la imagen, ya sea remota o local */
    public function getImagenUrlAttribute(): ?string
    {
        if (!$this->imagen) return null;
        if (filter_var($this->imagen, FILTER_VALIDATE_URL)) return $this->imagen;
        return url("storage/{$this->imagen}");
    }
}
