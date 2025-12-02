<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Privilegio;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PrivilegioController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50',
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

    // Método index, show, update, destroy (puedes completarlos con la misma estructura)
}
