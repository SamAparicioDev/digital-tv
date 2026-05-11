<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\Transaccion;
use App\Models\MetodoPago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RecargaController extends Controller
{
    public function index(Request $request)
    {
        $user   = $request->user();
        $wallet = Wallet::where('user_id', $user->id)->first();

        if (!$wallet) {
            return response()->json(['message' => 'No tienes billetera asignada'], 404);
        }

        $transacciones = $wallet->transacciones()
            ->with('metodoPago')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'saldo_actual'  => $wallet->saldo,
            'wallet_id'     => $wallet->id,
            'transacciones' => $transacciones,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'monto'           => 'required|numeric|min:1000',
            'metodo_pago_id'  => 'required|exists:metodos_pago,id',
            'referencia_pago' => 'required|string|max:255',
        ]);

        $user   = $request->user();
        $wallet = Wallet::where('user_id', $user->id)->first();

        if (!$wallet) {
            return response()->json(['message' => 'No tienes billetera asignada para recargar.'], 404);
        }

        $metodo  = MetodoPago::findOrFail($request->metodo_pago_id);
        $saldoAnt = $wallet->saldo;

        $transaccion = Transaccion::create([
            'wallet_id'       => $wallet->id,
            'metodo_pago_id'  => $metodo->id,
            'referencia_pago' => $request->referencia_pago,
            'tipo'            => 'deposit',
            'monto'           => $request->monto,
            'saldo_anterior'  => $saldoAnt,
            'saldo_nuevo'     => $saldoAnt,
            'descripcion'     => "Recarga vía {$metodo->nombre} | Ref: {$request->referencia_pago}",
        ]);

        return response()->json([
            'ok'         => true,
            'message'    => 'Solicitud de recarga enviada. Esperando aprobación.',
            'transaccion' => $transaccion->load('metodoPago'),
        ], 201);
    }

    public function comprobante(Request $request, $id)
    {
        $user   = $request->user();
        $wallet = Wallet::where('user_id', $user->id)->first();

        if (!$wallet) {
            return response()->json(['message' => 'Wallet no encontrada'], 404);
        }

        $transaccion = $wallet->transacciones()->where('id', $id)->first();

        if (!$transaccion) {
            return response()->json(['message' => 'Transacción no encontrada o no te pertenece.'], 404);
        }

        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
        ]);

        // Eliminar comprobante anterior si existía
        if ($transaccion->comprobante_url) {
            Storage::disk('public')->delete($transaccion->comprobante_url);
        }

        $path = $request->file('file')->store('comprobantes', 'public');
        $transaccion->update(['comprobante_url' => $path]);

        return response()->json([
            'ok'             => true,
            'comprobante_url' => url("storage/{$path}"),
        ]);
    }

    public function show(Request $request, $id)
    {
        $user   = $request->user();
        $wallet = Wallet::where('user_id', $user->id)->first();

        if (!$wallet) {
            return response()->json(['message' => 'Wallet no encontrada'], 404);
        }

        $transaccion = $wallet->transacciones()->with('metodoPago')->where('id', $id)->first();

        if (!$transaccion) {
            return response()->json(['message' => 'Transacción no encontrada o no te pertenece.'], 404);
        }

        return response()->json($transaccion, 200);
    }
}
