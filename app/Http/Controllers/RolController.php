<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rol;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class RolController extends Controller
{
    /**
     * Muestra todos los roles, precargando privilegios y descuentos.
     */
    public function index()
    {
        // Cargamos las relaciones para ver sus privilegios y descuentos asociados
        $roles = Rol::with(['privilegios', 'descuentos'])->get();
        return response()->json($roles, 200);
    }

    /**
     * Crea un nuevo rol.
     */
    public function store(Request $request)
    {
        $request->validate([
            // Validamos que el nombre sea único en la tabla 'rol'
            'nombre' => 'required|string|max:30|unique:rol,nombre',
            'descripcion' => 'required|string|max:255'
        ]);

        $rol = Rol::create(
            $request->only('nombre', 'descripcion')
        );

        return response()->json($rol, 201);
    }

    /**
     * Muestra un rol específico, precargando privilegios y descuentos.
     */
    public function show($id) // Usamos $id para buscar manualmente o Rol $rol con binding
    {
        $rol = Rol::with(['privilegios', 'descuentos'])->findOrFail($id);
        return response()->json($rol, 200);
    }

    /**
     * Actualiza un rol.
     */
    public function update($id, Request $request)
    {
        $rol = Rol::findOrFail($id);

        $request->validate([
            // Ignoramos el ID del rol actual para permitir guardar el mismo nombre si no cambia
            'nombre' => ['nullable', 'string', 'max:30', Rule::unique('rol', 'nombre')->ignore($rol->id)],
            'descripcion' => 'nullable|string|max:255'
        ]);

        $rol->update($request->only('nombre', 'descripcion'));

        return response()->json($rol->load(['privilegios', 'descuentos']), 200);
    }

    /**
     * Elimina un rol.
     */
    public function destroy($id)
    {
        $rol = Rol::findOrFail($id);

        // Validar si es un rol crítico antes de borrar (opcional, pero recomendado)
        if (in_array(strtolower($rol->nombre), ['admin', 'super admin'])) {
            return response()->json(['message' => 'No puedes eliminar un rol del sistema.'], 403);
        }

        $rol->delete();
        // Las relaciones en tablas pivote se eliminan por onDelete('cascade') en la BD.

        return response()->json(['message' => 'Rol eliminado exitosamente'], 204);
    }

    // --- MÉTODOS DE SINCRONIZACIÓN DE RELACIONES ---

    /**
     * Sincroniza (asigna/desasigna) privilegios a un rol.
     * Endpoint: PUT /api/rol/{rol}/privilegios
     */
    public function syncPrivilegios(Request $request, $id)
    {
        $rol = Rol::findOrFail($id);

        $request->validate([
            'privilegio_ids' => 'required|array',
            'privilegio_ids.*' => ['required', 'string', Rule::exists('privilegios', 'id')],
        ]);

        // sync() reemplaza todos los privilegios anteriores con los nuevos enviados
        $rol->privilegios()->sync($request->privilegio_ids);

        return response()->json($rol->load('privilegios'), 200);
    }

    /**
     * Sincroniza descuentos aplicables a este rol.
     * Endpoint: PUT /api/rol/{rol}/descuentos (Necesitas agregar esta ruta si la usas)
     */
    public function syncDescuentos(Request $request, $id)
    {
        $rol = Rol::findOrFail($id);

        $request->validate([
            'descuentos' => 'required|array',
            'descuentos.*.descuento_id' => ['required', 'integer', Rule::exists('descuentos', 'id')],
            // Datos del pivote 'descuento_rol'
            'descuentos.*.valor_descuento' => 'required|numeric|min:0',
            'descuentos.*.tipo_descuento' => ['required', Rule::in(['porcentaje', 'fijo'])],
        ]);

        // Preparamos el array para sync con datos pivote
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
