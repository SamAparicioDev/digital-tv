<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\Transaccion;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RecargaController extends Controller
{
  
    public function index(Request $request)
    {
        $user = $request->user();

        $wallet = Wallet::where('user_id', $user->id)->first();

        if (!$wallet) {
            return response()->json(['message' => 'No tienes billetera asignada'], 404);
        }

        $transacciones = $wallet->transacciones()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'saldo_actual' => $wallet->saldo,
            'wallet_id'    => $wallet->id,
            'transacciones' => $transacciones
        ]);
    }


    public function store(Request $request)
    {
        $request->validate([
            'monto' => 'required|numeric|min:0.01',
            'referencia_pago' => 'nullable|string|max:255'
        ]);

        $user = $request->user();

        $wallet = Wallet::where('user_id', $user->id)->first();

        if (!$wallet) {
            return response()->json(['message' => 'No tienes billetera asignada para recargar.'], 404);
        }

        $saldoAnterior = $wallet->saldo;
        $saldoNuevo = $saldoAnterior + $request->monto;

        $transaccion = Transaccion::create([
            'wallet_id' => $wallet->id,
            'tipo'      => 'ingreso',
            'monto'     => $request->monto,
            'saldo_anterior' => $saldoAnterior,
            'saldo_nuevo'    => $saldoNuevo,
            'estado'    => 'pendiente',
            'referencia' => $request->referencia_pago ?? 'REC-' . strtoupper(Str::random(8)),
            'descripcion' => 'Solicitud de recarga de saldo'
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'Solicitud de recarga enviada. Esperando aprobación.',
            'transaccion' => $transaccion
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $wallet = Wallet::where('user_id', $user->id)->first();

        if (!$wallet) {
            return response()->json(['message' => 'Wallet no encontrada'], 404);
        }

        $transaccion = $wallet->transacciones()->where('id', $id)->first();

        if (!$transaccion) {
            return response()->json(['message' => 'Transacción no encontrada o no te pertenece.'], 404);
        }

        return response()->json($transaccion, 200);
    }
}
