<?php

namespace App\Http\Controllers;

use App\Models\Oferta;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // ✅ Agregado para logs

class OfertaController extends Controller
{
    /**
     * Muestra una lista de todas las ofertas.
     */
    public function index()
    {
        // Cargamos la relación 'servicios' para que el usuario vea qué incluye el paquete
        $ofertas = Oferta::with('servicios')->get();
        return response()->json($ofertas, 200);
    }

    /**
     * Almacena una nueva mega-oferta y asocia múltiples servicios.
     */
    public function store(Request $request)
    {
        $request->validate([
            // Datos globales
            'garantia_dias' => 'required|integer|min:0',
            'precio' => 'required|numeric|min:0.01',
            'stock' => 'required|integer|min:0',
            'cuenta_completa' => 'present|boolean',
            'is_active' => 'present|boolean',

            // Datos de la relación (Pivote)
            'servicios_incluidos' => 'required|array|min:1',
            'servicios_incluidos.*.streaming_service_id' => ['required', 'integer', Rule::exists('streaming_services', 'id')],
            'servicios_incluidos.*.numero_perfiles' => 'required|integer|min:1',
            'servicios_incluidos.*.duracion_dias' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            // 1. Crear la Oferta
            $oferta = Oferta::create($request->except('servicios_incluidos'));

            // 2. Asociar Servicios
            if ($request->has('servicios_incluidos')) {
                $serviciosData = collect($request->servicios_incluidos)->mapWithKeys(function ($item) {
                    return [
                        $item['streaming_service_id'] => [
                            'numero_perfiles' => $item['numero_perfiles'],
                            'duracion_dias' => $item['duracion_dias'],
                            'is_active' => $item['is_active'] ?? true,
                        ]
                    ];
                })->toArray();

                $oferta->servicios()->attach($serviciosData);
            }

            DB::commit();

            return response()->json($oferta->load('servicios'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            // ✅ Guardamos el error en el log del sistema
            Log::error("Error creando oferta: " . $e->getMessage());

            return response()->json([
                'message' => 'Error al crear la oferta.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Muestra una oferta específica.
     */
    public function show(Oferta $oferta)
    {
        return response()->json($oferta->load('servicios'), 200);
    }

    /**
     * Actualiza la oferta.
     */
    public function update(Request $request, Oferta $oferta)
    {
        $request->validate([
            'garantia_dias' => 'nullable|integer|min:0',
            'precio' => 'nullable|numeric|min:0.01',
            'stock' => 'nullable|integer|min:0',
            'cuenta_completa' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',

            'servicios_incluidos' => 'nullable|array',
            'servicios_incluidos.*.streaming_service_id' => ['required', 'integer', Rule::exists('streaming_services', 'id')],
            'servicios_incluidos.*.numero_perfiles' => 'required|integer|min:1',
            'servicios_incluidos.*.duracion_dias' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            // 1. Actualizar datos base
            $oferta->update($request->except('servicios_incluidos'));

            // 2. Sincronizar servicios (Solo si se envía el array)
            if ($request->has('servicios_incluidos')) {
                $serviciosData = collect($request->servicios_incluidos)->mapWithKeys(function ($item) {
                    return [
                        $item['streaming_service_id'] => [
                            'numero_perfiles' => $item['numero_perfiles'],
                            'duracion_dias' => $item['duracion_dias'],
                            'is_active' => $item['is_active'] ?? true,
                        ]
                    ];
                })->toArray();

                $oferta->servicios()->sync($serviciosData);
            }

            DB::commit();

            return response()->json($oferta->load('servicios'), 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error actualizando oferta: " . $e->getMessage());

            return response()->json([
                'message' => 'Error al actualizar la oferta.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina la oferta.
     */
    public function destroy(Oferta $oferta)
    {
        try {
            $oferta->delete();
            // ✅ Cambiado a 200 para que el frontend pueda leer el mensaje JSON
            return response()->json(['message' => 'Oferta eliminada exitosamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'No se pudo eliminar la oferta.'], 500);
        }
    }
}
