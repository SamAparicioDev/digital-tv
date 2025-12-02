<?php

namespace App\Http\Controllers;

use App\Models\StreamingService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage; // ✅ Importante para borrar imágenes

class StreamingServiceController extends Controller
{
    /**
     * Listar servicios.
     */
    public function index()
    {
        // Si quieres que los usuarios vean los servicios activos primero, puedes filtrar:
        // $services = StreamingService::where('is_active', true)->get();
        // Pero para el admin, mejor ver todos:
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
            'logo_url' => 'nullable|image|mimes:jpeg,png,jpg,svg,webp|max:2048',
            'primary_color' => 'nullable|string|max:20',
            'cantidad_cuentas' => 'required|integer|min:0',
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
        return response()->json($streamingService, 200);
    }

    /**
     * Actualizar servicio.
     */
    public function update(Request $request, StreamingService $streamingService)
    {
        $request->validate([
            'name' => ['nullable', 'string', 'max:255', Rule::unique('streaming_services')->ignore($streamingService->id)],
            'logo_url' => 'nullable|image|mimes:jpeg,png,jpg,svg,webp|max:2048',
            'primary_color' => 'nullable|string|max:20',
            'cantidad_cuentas' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean'
        ]);

        $data = $request->except(['logo_url', 'slug']);

        if ($request->has('name')) {
            $data['slug'] = Str::slug($request->name);
        }

        if ($request->hasFile('logo_url')) {
            // 🗑️ LÓGICA NUEVA: Borrar imagen anterior si existe
            if ($streamingService->logo_url && Storage::disk('public')->exists($streamingService->logo_url)) {
                Storage::disk('public')->delete($streamingService->logo_url);
            }

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
        // 🗑️ LÓGICA NUEVA: Borrar imagen asociada antes de eliminar el registro
        if ($streamingService->logo_url && Storage::disk('public')->exists($streamingService->logo_url)) {
            Storage::disk('public')->delete($streamingService->logo_url);
        }

        $streamingService->delete();

        return response()->json(['message' => 'Servicio eliminado correctamente'], 204);
    }
}
