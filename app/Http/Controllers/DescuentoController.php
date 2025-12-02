<?php

namespace App\Http\Controllers;

use App\Models\Descuento;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // Para mejor manejo de errores

class DescuentoController extends Controller
{
    /**
     * Muestra una lista de todos los descuentos con sus roles asignados.
     */
    public function index()
    {
        $descuentos = Descuento::with('roles')->get();
        return response()->json($descuentos);
    }

    /**
     * Almacena un nuevo descuento y lo asigna a roles.
     */
    public function store(Request $request)
    {
        $request->validate([
            'codigo' => 'nullable|string|max:255|unique:descuentos',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'es_recurrente' => 'boolean',
            'is_active' => 'boolean',
            'roles_asignar' => 'array',
            'roles_asignar.*.role_id' => ['required', Rule::exists('rol', 'id')],
            'roles_asignar.*.valor_descuento' => 'required|numeric|min:0.01',
            'roles_asignar.*.tipo_descuento' => ['required', Rule::in(['porcentaje', 'fijo'])],
        ]);

        DB::beginTransaction();

        try {
            $descuento = Descuento::create($request->except('roles_asignar'));

            if ($request->has('roles_asignar')) {
                $rolesData = collect($request->roles_asignar)->mapWithKeys(function ($item) {
                    return [
                        $item['role_id'] => [
                            'valor_descuento' => $item['valor_descuento'],
                            'tipo_descuento' => $item['tipo_descuento'],
                            'is_active' => $item['is_active'] ?? true, // Asigna valor por defecto si no viene
                        ]
                    ];
                })->toArray();

                $descuento->roles()->attach($rolesData);
            }

            DB::commit();

            return response()->json($descuento->load('roles'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error creando descuento: " . $e->getMessage());

            return response()->json([
                'message' => 'Error al crear el descuento y asignar roles.',
            ], 500);
        }
    }

    /**
     * Muestra un descuento específico.
     */
    public function show(Descuento $descuento)
    {
        return response()->json($descuento->load('roles'));
    }

    /**
     * Actualiza un descuento y sincroniza sus roles asignados.
     */
    public function update(Request $request, Descuento $descuento)
    {
        $request->validate([
            // Excluye el registro actual de la validación unique
            'codigo' => ['nullable', 'string', 'max:255', Rule::unique('descuentos')->ignore($descuento->id)],
            'nombre' => 'required|string|max:255',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',

            // Validación de roles similar a 'store'
            'roles_asignar' => 'array',
            'roles_asignar.*.role_id' => ['required', Rule::exists('rol', 'id')],
            'roles_asignar.*.valor_descuento' => 'required|numeric|min:0.01',
            'roles_asignar.*.tipo_descuento' => ['required', Rule::in(['porcentaje', 'fijo'])],
        ]);

        DB::beginTransaction();

        try {
            // 1. Actualizar el descuento
            $descuento->update($request->except('roles_asignar'));

            // 2. Sincronizar roles
            if ($request->has('roles_asignar')) {
                // mapWithKeys prepara los datos del pivote de la misma manera
                $rolesData = collect($request->roles_asignar)->mapWithKeys(function ($item) {
                    return [
                        $item['role_id'] => [
                            'valor_descuento' => $item['valor_descuento'],
                            'tipo_descuento' => $item['tipo_descuento'],
                            'is_active' => $item['is_active'] ?? true,
                        ]
                    ];
                })->toArray();

                // sync() maneja el 'attach', 'detach' y 'update' automáticamente
                $descuento->roles()->sync($rolesData);
            } else {
                // Si el array está vacío o no se envió, puedes optar por desvincular todos los roles
                $descuento->roles()->detach();
            }

            DB::commit();

            return response()->json($descuento->load('roles'));

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error actualizando descuento: " . $e->getMessage());

            return response()->json([
                'message' => 'Error al actualizar el descuento y sincronizar roles.',
            ], 500);
        }
    }

    /**
     * Elimina el descuento.
     */
    public function destroy(Descuento $descuento)
    {
        // Debido al onDelete('cascade') en la migración de 'descuento_rol',
        // los registros pivote se eliminarán automáticamente.
        $descuento->delete();

        return response()->json(null, 204);
    }
}
