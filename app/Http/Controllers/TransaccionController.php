<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\Transaccion;
use Illuminate\Http\Request;

class TransaccionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $wallet = Wallet::where('user_id', $user->id)->firstOrFail();

        $transacciones = $wallet->transacciones()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'wallet'        => $wallet,
            'transacciones' => $transacciones
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'tipo'  => 'required|in:ingreso,gasto',
            'valor' => 'required|numeric|min:0.01'
        ]);

        $user = $request->user();

        $wallet = Wallet::where('user_id', $user->id)->firstOrFail();

        $transaccion = Transaccion::create([
            'wallet_id' => $wallet->id,
            'tipo'      => $request->tipo,
            'valor'     => $request->valor,
            'estado'    => 'pendiente'
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'Transacción creada y enviada para aprobación',
            'transaccion' => $transaccion
        ], 201);
    }
}
