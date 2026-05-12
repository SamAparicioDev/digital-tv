<?php

namespace App\Http\Controllers;

use App\Models\Tutorial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TutorialController extends Controller
{
    public function index()
    {
        // Caché del array (no del Collection) para preservar los $appends (thumbnail_url, embed_url)
        $data = Cache::remember('tutoriales_all', 120, fn() =>
            Tutorial::with('categoria')->orderBy('created_at', 'desc')->get()->toArray()
        );
        return response()->json($data);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo'       => 'required|string|max:255',
            'descripcion'  => 'nullable|string|max:500',
            'youtube_url'  => 'required|string|max:500',
            'duracion'     => 'nullable|string|max:20',
            'categoria_id' => 'nullable|exists:tutorial_categorias,id',
            'is_active'    => 'boolean',
        ]);

        $youtubeId = Tutorial::extraerYouTubeId($request->youtube_url);
        if (!$youtubeId) {
            return response()->json([
                'message' => 'No se pudo extraer el ID del video. Verifica que sea una URL de YouTube válida (watch?v=, youtu.be/, embed/, shorts/).',
            ], 422);
        }

        $tutorial = Tutorial::create([
            'titulo'       => $request->titulo,
            'descripcion'  => $request->descripcion,
            'youtube_url'  => $request->youtube_url,
            'youtube_id'   => $youtubeId,
            'duracion'     => $request->duracion,
            'categoria_id' => $request->categoria_id,
            'is_active'    => $request->is_active ?? true,
        ]);

        Cache::forget('tutoriales_all');
        // Devolvemos toArray() para que incluya thumbnail_url y embed_url ($appends)
        return response()->json(array_merge($tutorial->toArray(), ['categoria' => $tutorial->categoria]), 201);
    }

    public function show(Tutorial $tutorial)
    {
        return response()->json($tutorial->load('categoria'));
    }

    public function update(Request $request, Tutorial $tutorial)
    {
        $request->validate([
            'titulo'       => 'sometimes|required|string|max:255',
            'descripcion'  => 'nullable|string|max:500',
            'youtube_url'  => 'sometimes|string|max:500',
            'duracion'     => 'nullable|string|max:20',
            'categoria_id' => 'nullable|exists:tutorial_categorias,id',
            'is_active'    => 'boolean',
        ]);

        $data = $request->only(['titulo', 'descripcion', 'youtube_url', 'duracion', 'categoria_id', 'is_active']);

        if ($request->filled('youtube_url')) {
            $newId = Tutorial::extraerYouTubeId($request->youtube_url);
            if (!$newId) {
                return response()->json(['message' => 'URL de YouTube inválida.'], 422);
            }
            $data['youtube_id'] = $newId;
        }

        $tutorial->update($data);
        Cache::forget('tutoriales_all');
        $tutorial->load('categoria');
        return response()->json(array_merge($tutorial->toArray(), ['categoria' => $tutorial->categoria]));
    }

    public function destroy(Tutorial $tutorial)
    {
        $tutorial->delete();
        Cache::forget('tutoriales_all');
        return response()->json(['message' => 'Tutorial eliminado']);
    }
}
