<?php

namespace App\Http\Controllers;

use App\Models\Privilegio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PrivilegioController extends Controller
{
    /**
     * Muestra la lista de privilegios.
     */
    public function index()
    {
        // Cargamos los roles para saber quién tiene qué permiso
        $privilegios = Privilegio::with('roles')->get();
        return response()->json($privilegios, 200);
    }

    /**
     * Crea un nuevo privilegio y lo asigna a roles opcionalmente.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50|unique:privilegios,nombre',
            'acceso' => 'required|string|max:20', // Ej: GET, POST, MENU
            'descripcion' => 'required|string|max:255',
            'roles_asignar' => 'array', // Array de IDs de roles
            'roles_asignar.*' => ['required', 'string', Rule::exists('rol', 'id')],
        ]);

        DB::beginTransaction();

        try {
            $privilegio = Privilegio::create($request->only('nombre', 'acceso', 'descripcion'));

            if ($request->has('roles_asignar')) {
                // Como es una relación simple sin datos extra en el pivote,
                // pasamos el array de IDs directamente.
                $privilegio->roles()->attach($request->roles_asignar);
            }

            DB::commit();

            return response()->json($privilegio->load('roles'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el privilegio y asignar roles.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Muestra un privilegio específico.
     */
    public function show($id)
    {
        // Buscamos por ID y cargamos roles
        $privilegio = Privilegio::with('roles')->findOrFail($id);
        return response()->json($privilegio, 200);
    }

    /**
     * Actualiza un privilegio existente.
     */
    public function update(Request $request, $id)
    {
        $privilegio = Privilegio::findOrFail($id);

        $request->validate([
            // Ignoramos el ID actual para permitir mantener el mismo nombre
            'nombre' => ['required', 'string', 'max:50', Rule::unique('privilegios', 'nombre')->ignore($privilegio->id)],
            'acceso' => 'required|string|max:20',
            'descripcion' => 'required|string|max:255',
            'roles_asignar' => 'array',
            'roles_asignar.*' => ['required', 'string', Rule::exists('rol', 'id')],
        ]);

        DB::beginTransaction();

        try {
            $privilegio->update($request->only('nombre', 'acceso', 'descripcion'));

            // Sincronizar roles si se envía el array
            if ($request->has('roles_asignar')) {
                // sync: Quita los roles viejos y pone los nuevos
                $privilegio->roles()->sync($request->roles_asignar);
            }

            DB::commit();

            return response()->json($privilegio->load('roles'), 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el privilegio.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina un privilegio.
     */
    public function destroy($id)
    {
        $privilegio = Privilegio::findOrFail($id);

        // Cuidado: Eliminar un permiso puede romper el acceso a ciertas partes del sistema
        // si está hardcodeado en el código (middleware).
        $privilegio->delete();

        return response()->json(['message' => 'Privilegio eliminado correctamente'], 204);
    }
}
