<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tutorial extends Model
{
    protected $table = 'tutoriales';

    protected $fillable = [
        'titulo', 'descripcion', 'youtube_url', 'youtube_id',
        'duracion', 'categoria_id', 'is_active'
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function categoria()
    {
        return $this->belongsTo(TutorialCategoria::class, 'categoria_id');
    }

    /** Extrae el ID de YouTube de cualquier URL común (watch, youtu.be, embed, shorts, m.youtube). */
    public static function extraerYouTubeId(string $url): ?string
    {
        $url = trim($url);

        // Si solo nos pasaron el ID directamente (11 chars alfanuméricos)
        if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $url)) return $url;

        // Patrones cubren: ?v=, &v=, youtu.be/, /embed/, /shorts/, /v/
        $patterns = [
            '/[?&]v=([a-zA-Z0-9_-]{11})/',
            '/youtu\.be\/([a-zA-Z0-9_-]{11})/',
            '/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/',
            '/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/',
            '/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/',
        ];
        foreach ($patterns as $p) {
            if (preg_match($p, $url, $m)) return $m[1];
        }
        return null;
    }

    /** Thumbnail oficial de YouTube — sin necesidad de API key */
    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->youtube_id) return null;
        return "https://img.youtube.com/vi/{$this->youtube_id}/hqdefault.jpg";
    }

    /** URL embed para el iframe */
    public function getEmbedUrlAttribute(): ?string
    {
        if (!$this->youtube_id) return null;
        return "https://www.youtube.com/embed/{$this->youtube_id}";
    }

    protected $appends = ['thumbnail_url', 'embed_url'];
}
