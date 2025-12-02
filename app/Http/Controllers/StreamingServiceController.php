<?php

namespace App\Http\Controllers;

use App\Models\StreamingService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StreamingServiceController extends Controller
{
    /**
     * Listar servicios.
     */
    public function index()
    {
        $services = StreamingService::all();
        return response()->json($services, 200);
    }

    /**
     * Crear servicio.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:streaming_services',
            'logo_url' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'primary_color' => 'nullable|string|max:20',
            'cantidad_cuentas' => 'required|integer|min:0', // ✅ Nuevo campo validado
            'is_active' => 'present|boolean'
        ]);

        $data = $request->all();
        $data['slug'] = Str::slug($request->name);

        if ($request->hasFile('logo_url')) {
            $path = $request->file('logo_url')->store('logos', 'public');
            $data['logo_url'] = $path;
        }

        $streamingService = StreamingService::create($data);

        return response()->json($streamingService, 201);
    }

    /**
     * Mostrar un servicio.
     */
    public function show(StreamingService $streamingService)
    {
        // Opcional: cargar ofertas relacionadas con ->load('ofertas')
        return response()->json($streamingService, 200);
    }

    /**
     * Actualizar servicio.
     */
    public function update(Request $request, StreamingService $streamingService)
    {
        $request->validate([
            // Ignoramos el ID actual para la validación de unique
            'name' => ['nullable', 'string', 'max:255', Rule::unique('streaming_services')->ignore($streamingService->id)],
            'logo_url' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'primary_color' => 'nullable|string|max:20',
            'cantidad_cuentas' => 'nullable|integer|min:0', // ✅ Validación en update
            'is_active' => 'nullable|boolean'
        ]);

        $data = $request->except(['logo_url', 'slug']); // Slug se regenera solo si cambia el nombre

        if ($request->has('name')) {
            $data['slug'] = Str::slug($request->name);
        }

        if ($request->hasFile('logo_url')) {
            // Aquí podrías borrar la imagen anterior si quisieras
            $path = $request->file('logo_url')->store('logos', 'public');
            $data['logo_url'] = $path;
        }

        $streamingService->update($data);

        return response()->json($streamingService, 200);
    }

    /**
     * Eliminar servicio.
     */
    public function destroy(StreamingService $streamingService)
    {
        $streamingService->delete();
        return response()->json(['message' => 'Servicio eliminado correctamente'], 204);
    }
}
