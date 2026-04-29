<?php

namespace App\Http\Controllers;

use App\Models\Privilegio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PrivilegioController extends Controller
{
    public function index()
    {
        $privilegios = Privilegio::with('roles')->get();
        return response()->json($privilegios, 200);
    }


    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50|unique:privilegios,nombre',
            'acceso' => 'required|string|max:20',
            'descripcion' => 'required|string|max:255',
            'roles_asignar' => 'array',
            'roles_asignar.*' => ['required', 'string', Rule::exists('rol', 'id')],
        ]);

        DB::beginTransaction();

        try {
            $privilegio = Privilegio::create($request->only('nombre', 'acceso', 'descripcion'));

            if ($request->has('roles_asignar')) {
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

    public function show($id)
    {
        $privilegio = Privilegio::with('roles')->findOrFail($id);
        return response()->json($privilegio, 200);
    }

    public function update(Request $request, $id)
    {
        $privilegio = Privilegio::findOrFail($id);

        $request->validate([
            'nombre' => ['required', 'string', 'max:50', Rule::unique('privilegios', 'nombre')->ignore($privilegio->id)],
            'acceso' => 'required|string|max:20',
            'descripcion' => 'required|string|max:255',
            'roles_asignar' => 'array',
            'roles_asignar.*' => ['required', 'string', Rule::exists('rol', 'id')],
        ]);

        DB::beginTransaction();

        try {
            $privilegio->update($request->only('nombre', 'acceso', 'descripcion'));

            if ($request->has('roles_asignar')) {
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
    public function destroy($id)
    {
        $privilegio = Privilegio::findOrFail($id);
        $privilegio->delete();

        return response()->json(['message' => 'Privilegio eliminado correctamente'], 204);
    }
}
