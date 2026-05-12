<?php

namespace App\Http\Controllers;

use App\Models\Estreno;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class EstrenoController extends Controller
{
    public function index()
    {
        // Cacheamos toArray() para preservar el accessor imagen_url ($appends)
        $data = Cache::remember('estrenos_all', 120, fn() =>
            Estreno::with('streamingServices')->orderBy('created_at', 'desc')->get()->toArray()
        );
        return response()->json($data);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo'                  => 'required|string|max:255',
            'formato'                 => ['required', Rule::in(['pelicula', 'serie'])],
            'imagen'                  => 'nullable|string|max:500',
            'is_active'               => 'boolean',
            'streaming_service_ids'   => 'nullable|array',
            'streaming_service_ids.*' => 'exists:streaming_services,id',
        ]);

        DB::beginTransaction();
        try {
            $estreno = Estreno::create($request->only(['titulo', 'formato', 'imagen', 'is_active']));
            if ($request->filled('streaming_service_ids')) {
                $estreno->streamingServices()->sync($request->streaming_service_ids);
            }
            DB::commit();
            Cache::forget('estrenos_all');
            return response()->json($estreno->load('streamingServices'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear estreno', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Estreno $estreno)
    {
        return response()->json($estreno->load('streamingServices'));
    }

    public function update(Request $request, Estreno $estreno)
    {
        $request->validate([
            'titulo'                  => 'sometimes|required|string|max:255',
            'formato'                 => ['sometimes', Rule::in(['pelicula', 'serie'])],
            'imagen'                  => 'nullable|string|max:500',
            'is_active'               => 'boolean',
            'streaming_service_ids'   => 'nullable|array',
            'streaming_service_ids.*' => 'exists:streaming_services,id',
        ]);

        DB::beginTransaction();
        try {
            $estreno->update($request->only(['titulo', 'formato', 'imagen', 'is_active']));
            if ($request->has('streaming_service_ids')) {
                $estreno->streamingServices()->sync($request->streaming_service_ids ?? []);
            }
            DB::commit();
            Cache::forget('estrenos_all');
            return response()->json($estreno->load('streamingServices'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar estreno', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Estreno $estreno)
    {
        // Eliminar imagen local si existe
        if ($estreno->imagen && !filter_var($estreno->imagen, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($estreno->imagen);
        }
        $estreno->delete();
        Cache::forget('estrenos_all');
        return response()->json(['message' => 'Estreno eliminado']);
    }
}
