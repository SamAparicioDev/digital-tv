<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rol;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class RolController extends Controller
{
    /**
     * Crea un nuevo rol.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'string|required|max:30',
            'descripcion' => 'string|required|max:255'
        ]);

        $rol = Rol::create(
            $request->only('nombre', 'descripcion')
        );

        return response()->json($rol, 201);
    }

    /**
     * Muestra todos los roles, precargando privilegios y descuentos.
     */
    public function index()
    {
        // 🚨 CAMBIO: Cargamos las relaciones para ver sus privilegios y descuentos
        $roles = Rol::with(['privilegios', 'descuentos'])->get();
        return response()->json($roles, 200);
    }

    /**
     * Muestra un rol específico, precargando privilegios y descuentos.
     */
    public function show($id)
    {
        // 🚨 CAMBIO: Cargamos las relaciones
        $rol = Rol::with(['privilegios', 'descuentos'])->findOrFail($id);

        return response()->json($rol, 200);
    }

    /**
     * Actualiza un rol.
     */
    public function update($id, Request $request)
    {
        $request->validate(['nombre' => 'nullable|string|max:30', 'descripcion' => 'nullable|string|max:255']);
        $rol = Rol::findOrFail($id);
        $rol->update($request->only('nombre', 'descripcion'));
        return response()->json($rol, 200);
    }

    /**
     * Elimina un rol.
     */
    public function destroy($id)
    {
        $rol = Rol::findOrFail($id);
        $rol->delete();
        // Las entradas en 'privilegio_rol' y 'descuento_rol' deberían eliminarse
        // automáticamente si tus migraciones tienen onDelete('cascade').
        return response()->json("Rol eliminado exitosamente", 200);
    }

    // --- Métodos de Sincronización (Opcional pero útil) ---

    /**
     * Sincroniza (asigna/desasigna) privilegios a un rol existente.
     * Método: PUT/PATCH /api/rol/{rol}/privilegios
     */
    public function syncPrivilegios(Request $request, Rol $rol)
    {
        $request->validate([
            'privilegio_ids' => 'required|array',
            // Asegura que todos los IDs de privilegios existan
            'privilegio_ids.*' => ['required', 'string', Rule::exists('privilegios', 'id')],
        ]);

        // sync() sincroniza la tabla pivote 'privilegio_rol'
        $rol->privilegios()->sync($request->privilegio_ids);

        return response()->json($rol->load('privilegios'), 200);
    }
}
