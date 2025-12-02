<?php

namespace App\Http\Controllers;

use App\Models\Descuento;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DescuentoController extends Controller
{
    /**
     * Muestra una lista de todos los descuentos con sus roles asignados.
     */
    public function index()
    {
        // Cargamos la relación 'roles' para ver a quién aplica cada descuento
        $descuentos = Descuento::with('roles')->get();
        return response()->json($descuentos, 200);
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

            // Validación de roles (opcional en la creación)
            'roles_asignar' => 'array',
            'roles_asignar.*.role_id' => ['required', Rule::exists('rol', 'id')],
            'roles_asignar.*.valor_descuento' => 'required|numeric|min:0.01',
            'roles_asignar.*.tipo_descuento' => ['required', Rule::in(['porcentaje', 'fijo'])],
        ]);

        DB::beginTransaction();

        try {
            // 1. Crear el descuento sin los datos del array de roles
            $descuento = Descuento::create($request->except('roles_asignar'));

            // 2. Asignar roles si se enviaron
            if ($request->has('roles_asignar')) {
                $rolesData = collect($request->roles_asignar)->mapWithKeys(function ($item) {
                    return [
                        $item['role_id'] => [
                            'valor_descuento' => $item['valor_descuento'],
                            'tipo_descuento' => $item['tipo_descuento'],
                            'is_active' => $item['is_active'] ?? true,
                        ]
                    ];
                })->toArray();

                $descuento->roles()->attach($rolesData);
            }

            DB::commit();

            return response()->json($descuento->load('roles'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            // Log::error("Error creando descuento: " . $e->getMessage());

            return response()->json([
                'message' => 'Error al crear el descuento y asignar roles.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Muestra un descuento específico.
     */
    public function show(Descuento $descuento)
    {
        return response()->json($descuento->load('roles'), 200);
    }

    /**
     * Actualiza un descuento y sincroniza sus roles asignados.
     */
    public function update(Request $request, Descuento $descuento)
    {
        $request->validate([
            // En update, ignoramos el ID actual para la validación unique
            'codigo' => ['nullable', 'string', 'max:255', Rule::unique('descuentos')->ignore($descuento->id)],
            'nombre' => 'sometimes|required|string|max:255', // 'sometimes' permite validación parcial
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',

            'roles_asignar' => 'array',
            'roles_asignar.*.role_id' => ['required', Rule::exists('rol', 'id')],
            'roles_asignar.*.valor_descuento' => 'required|numeric|min:0.01',
            'roles_asignar.*.tipo_descuento' => ['required', Rule::in(['porcentaje', 'fijo'])],
        ]);

        DB::beginTransaction();

        try {
            // 1. Actualizar datos básicos del descuento
            $descuento->update($request->except('roles_asignar'));

            // 2. Sincronizar roles SOLO si se envía el campo 'roles_asignar'
            // Esto permite editar solo el nombre del descuento sin borrar sus roles accidentalmente.
            if ($request->has('roles_asignar')) {

                $rolesData = collect($request->roles_asignar)->mapWithKeys(function ($item) {
                    return [
                        $item['role_id'] => [
                            'valor_descuento' => $item['valor_descuento'],
                            'tipo_descuento' => $item['tipo_descuento'],
                            'is_active' => $item['is_active'] ?? true,
                        ]
                    ];
                })->toArray();

                // sync: actualiza existentes, agrega nuevos y elimina los que no estén en la lista enviada
                $descuento->roles()->sync($rolesData);
            }

            DB::commit();

            return response()->json($descuento->load('roles'), 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el descuento.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina el descuento.
     */
    public function destroy(Descuento $descuento)
    {
        // Al eliminar el descuento, la restricción onDelete('cascade') de la BD
        // se encargará de borrar las relaciones en 'descuento_rol'.
        $descuento->delete();

        return response()->json(['message' => 'Descuento eliminado correctamente'], 204);
    }
}
