<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rol;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class RolController extends Controller
{
    public function index()
    {
        $roles = Rol::with(['privilegios', 'descuentos'])->get();
        return response()->json($roles, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:30|unique:rol,nombre',
            'descripcion' => 'required|string|max:255'
        ]);

        $rol = Rol::create(
            $request->only('nombre', 'descripcion')
        );

        return response()->json($rol, 201);
    }

    public function show($id)
    {
        $rol = Rol::with(['privilegios', 'descuentos'])->findOrFail($id);
        return response()->json($rol, 200);
    }

    public function update($id, Request $request)
    {
        $rol = Rol::findOrFail($id);

        $request->validate([
            'nombre' => ['nullable', 'string', 'max:30', Rule::unique('rol', 'nombre')->ignore($rol->id)],
            'descripcion' => 'nullable|string|max:255'
        ]);

        $rol->update($request->only('nombre', 'descripcion'));

        return response()->json($rol->load(['privilegios', 'descuentos']), 200);
    }

    public function destroy($id)
    {
        $rol = Rol::findOrFail($id);

        if (in_array(strtolower($rol->nombre), ['admin', 'super admin'])) {
            return response()->json(['message' => 'No puedes eliminar un rol del sistema.'], 403);
        }

        $rol->delete();

        return response()->json(['message' => 'Rol eliminado exitosamente'], 204);
    }

    public function syncPrivilegios(Request $request, $id)
    {
        $rol = Rol::findOrFail($id);

        $request->validate([
            'privilegio_ids' => 'required|array',
            'privilegio_ids.*' => ['required', 'string', Rule::exists('privilegios', 'id')],
        ]);

        $rol->privilegios()->sync($request->privilegio_ids);

        return response()->json($rol->load('privilegios'), 200);
    }
    public function syncDescuentos(Request $request, $id)
    {
        $rol = Rol::findOrFail($id);

        $request->validate([
            'descuentos' => 'required|array',
            'descuentos.*.descuento_id' => ['required', 'integer', Rule::exists('descuentos', 'id')],
            'descuentos.*.valor_descuento' => 'required|numeric|min:0',
            'descuentos.*.tipo_descuento' => ['required', Rule::in(['porcentaje', 'fijo'])],
        ]);

        $syncData = [];
        foreach ($request->descuentos as $item) {
            $syncData[$item['descuento_id']] = [
                'valor_descuento' => $item['valor_descuento'],
                'tipo_descuento' => $item['tipo_descuento'],
                'is_active' => true
            ];
        }

        $rol->descuentos()->sync($syncData);

        return response()->json($rol->load('descuentos'), 200);
    }
}
