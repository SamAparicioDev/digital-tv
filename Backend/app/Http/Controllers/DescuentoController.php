<?php

namespace App\Http\Controllers;

use App\Models\Descuento;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DescuentoController extends Controller
{
    private function with(): array
    {
        return ['roles', 'streamingService', 'streamingServices'];
    }

    public function index()
    {
        $data = Cache::remember('descuentos', 120, fn() => Descuento::with($this->with())->get());
        return response()->json($data);
    }

    public function show(Descuento $descuento)
    {
        return response()->json($descuento->load($this->with()));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'        => 'required|string|max:255',
            'codigo'        => 'nullable|string|max:255|unique:descuentos',
            'descripcion'   => 'nullable|string',
            'fecha_inicio'  => 'required|date',
            'fecha_fin'     => 'nullable|date|after_or_equal:fecha_inicio',
            'es_recurrente' => 'boolean',
            'is_active'     => 'boolean',

            // Valor global (cuando no hay roles)
            'valor_global'  => 'nullable|numeric|min:0',
            'tipo_global'   => ['nullable', Rule::in(['porcentaje', 'fijo'])],

            // Múltiples servicios
            'streaming_service_ids'   => 'nullable|array',
            'streaming_service_ids.*' => 'exists:streaming_services,id',

            // Por rol
            'roles_asignar'                     => 'nullable|array',
            'roles_asignar.*.role_id'           => ['required', Rule::exists('rol', 'id')],
            'roles_asignar.*.valor_descuento'   => 'required|numeric|min:0',
            'roles_asignar.*.tipo_descuento'    => ['required', Rule::in(['porcentaje', 'fijo'])],
        ]);

        DB::beginTransaction();
        try {
            $descuento = Descuento::create($request->except(['roles_asignar', 'streaming_service_ids']));

            if ($request->filled('roles_asignar')) {
                $rolesData = collect($request->roles_asignar)->mapWithKeys(fn($item) => [
                    $item['role_id'] => [
                        'valor_descuento' => $item['valor_descuento'],
                        'tipo_descuento'  => $item['tipo_descuento'],
                        'is_active'       => true,
                    ]
                ])->toArray();
                $descuento->roles()->attach($rolesData);
            }

            if ($request->filled('streaming_service_ids')) {
                $descuento->streamingServices()->sync($request->streaming_service_ids);
            }

            DB::commit();
            Cache::forget('descuentos');
            return response()->json($descuento->load($this->with()), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear el descuento.', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, Descuento $descuento)
    {
        $request->validate([
            'nombre'        => 'sometimes|required|string|max:255',
            'codigo'        => ['nullable', 'string', 'max:255', Rule::unique('descuentos')->ignore($descuento->id)],
            'descripcion'   => 'nullable|string',
            'fecha_inicio'  => 'sometimes|required|date',
            'fecha_fin'     => 'nullable|date|after_or_equal:fecha_inicio',
            'es_recurrente' => 'boolean',
            'is_active'     => 'boolean',

            'valor_global'  => 'nullable|numeric|min:0',
            'tipo_global'   => ['nullable', Rule::in(['porcentaje', 'fijo'])],

            'streaming_service_ids'   => 'nullable|array',
            'streaming_service_ids.*' => 'exists:streaming_services,id',

            'roles_asignar'                   => 'nullable|array',
            'roles_asignar.*.role_id'         => ['required', Rule::exists('rol', 'id')],
            'roles_asignar.*.valor_descuento' => 'required|numeric|min:0',
            'roles_asignar.*.tipo_descuento'  => ['required', Rule::in(['porcentaje', 'fijo'])],
        ]);

        DB::beginTransaction();
        try {
            $descuento->update($request->except(['roles_asignar', 'streaming_service_ids']));

            if ($request->has('roles_asignar')) {
                $rolesData = collect($request->roles_asignar)->mapWithKeys(fn($item) => [
                    $item['role_id'] => [
                        'valor_descuento' => $item['valor_descuento'],
                        'tipo_descuento'  => $item['tipo_descuento'],
                        'is_active'       => true,
                    ]
                ])->toArray();
                $descuento->roles()->sync($rolesData);
            }

            if ($request->has('streaming_service_ids')) {
                $descuento->streamingServices()->sync($request->streaming_service_ids ?? []);
            }

            DB::commit();
            Cache::forget('descuentos');
            return response()->json($descuento->load($this->with()));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar el descuento.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Descuento $descuento)
    {
        $descuento->delete();
        Cache::forget('descuentos');
        return response()->json(['message' => 'Descuento eliminado correctamente'], 200);
    }
}
