<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rol;

class RolController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'string|required|max:30',
            'descripcion' => 'string|required|max:255'
        ]);

        $rol = Rol::create(
            [
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion
            ]
        );

        return response()->json($rol, 201);
    }

    public function index()
    {
        $roles = Rol::all();
        return response()->json($roles, 200);
    }

    public function show($id)
    {
        $rol = Rol::findOrFail($id);

        return response()->json($rol, 200);
    }

    public function update($id, Request $request)
    {
        $request->validate(['nombre' => 'nullable|string|max:30', 'descripcion' => 'nullable|string|max:255']);
        $rol = Rol::findOrFail($id);
        $rol->update($request->only('nombre', 'descripcion'));
        return response()->json($rol, 200);
    }


    public function destroy($id)
    {

        $rol =  Rol::findOrFail($id);
        $rol->delete();
        return response()->json("Rol eliminado exitosamente", 200);
    }
}
