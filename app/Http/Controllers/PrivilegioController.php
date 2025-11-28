<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Privilegio;


class PrivilegioController extends Controller
{

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50',
            'acceso' => 'required|string|max:20',
            'descripcion' => 'required|string|max:255'
        ]);
        $privilegio = Privilegio::create([
            'nombre' => $request->nombre,
            'acceso' => $request->acceso,
            'descripcion' => $request->descripcion
        ]);
        return response()->json($privilegio, 201);
    }


}
