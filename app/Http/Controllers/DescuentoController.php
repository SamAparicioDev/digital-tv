<?php

namespace App\Http\Controllers;

use App\Models\Descuento;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DescuentoController extends Controller
{

    public function index()
    {
        $descuentos = Descuento::with('roles')->get();
        return response()->json($descuentos, 200);
    }


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

            return response()->json([
                'message' => 'Error al crear el descuento y asignar roles.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Descuento $descuento)
    {
        return response()->json($descuento->load('roles'), 200);
    }

    public function update(Request $request, Descuento $descuento)
    {
        $request->validate([
            'codigo' => ['nullable', 'string', 'max:255', Rule::unique('descuentos')->ignore($descuento->id)],
            'nombre' => 'sometimes|required|string|max:255',
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',

            'roles_asignar' => 'array',
            'roles_asignar.*.role_id' => ['required', Rule::exists('rol', 'id')],
            'roles_asignar.*.valor_descuento' => 'required|numeric|min:0.01',
            'roles_asignar.*.tipo_descuento' => ['required', Rule::in(['porcentaje', 'fijo'])],
        ]);

        DB::beginTransaction();

        try {
            $descuento->update($request->except('roles_asignar'));
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

    public function destroy(Descuento $descuento)
    {

        $descuento->delete();

        return response()->json(['message' => 'Descuento eliminado correctamente'], 204);
    }
}
