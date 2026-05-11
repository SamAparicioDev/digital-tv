<?php

namespace App\Http\Controllers;

use App\Models\StreamingService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class StreamingServiceController extends Controller
{
    public function index()
    {
        return response()->json(StreamingService::all(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255|unique:streaming_services',
            'logo_url'      => 'nullable|string|max:500',   // URL string (se sube por /api/upload)
            'primary_color' => 'nullable|string|max:20',
            'is_active'     => 'boolean',
        ]);

        $data = $request->only(['name', 'logo_url', 'primary_color', 'is_active']);
        $data['slug'] = Str::slug($request->name);
        $data['cantidad_cuentas'] = 0;

        return response()->json(StreamingService::create($data), 201);
    }

    public function show(StreamingService $streamingService)
    {
        return response()->json($streamingService, 200);
    }

    public function update(Request $request, StreamingService $streamingService)
    {
        $request->validate([
            'name'          => ['nullable', 'string', 'max:255', Rule::unique('streaming_services')->ignore($streamingService->id)],
            'logo_url'      => 'nullable|string|max:500',
            'primary_color' => 'nullable|string|max:20',
            'is_active'     => 'nullable|boolean',
        ]);

        $data = $request->only(['name', 'logo_url', 'primary_color', 'is_active']);

        if ($request->has('name')) {
            $data['slug'] = Str::slug($request->name);
        }

        $streamingService->update($data);
        return response()->json($streamingService, 200);
    }

    public function destroy(StreamingService $streamingService)
    {
        // Eliminar logo almacenado si es una ruta local
        if ($streamingService->getOriginal('logo_url') && !filter_var($streamingService->getOriginal('logo_url'), FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($streamingService->getOriginal('logo_url'));
        }

        $streamingService->delete();
        return response()->json(['message' => 'Servicio eliminado'], 200);
    }
}
