<?php

namespace App\Http\Controllers;

use App\Models\MetodoPago;

class MetodoPagoController extends Controller
{
    public function index()
    {
        $metodos = MetodoPago::with('numeroCuentas')
            ->where('is_active', true)
            ->where('tipo', 'banco')
            ->orderBy('id')
            ->get();

        return response()->json($metodos);
    }
}
