<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\Transaccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class WalletController extends Controller
{
    public function index()
    {
        $wallets = Wallet::with('user')->get();
        return response()->json($wallets, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id|unique:wallets,user_id',
            'saldo'   => 'required|numeric|min:0'
        ]);

        $wallet = Wallet::create([
            'user_id' => $request->user_id,
            'saldo'   => $request->saldo
        ]);

        if ($request->saldo > 0) {
            Transaccion::create([
                'wallet_id'      => $wallet->id,
                'tipo'           => 'deposit',
                'monto'          => $request->saldo,
                'saldo_anterior' => 0,
                'saldo_nuevo'    => $request->saldo,
                'estado'         => 'APROBADO',
                'descripcion'    => 'Saldo inicial por creación manual - Admin #' . Auth::id(),
            ]);
        }

        return response()->json([
            'ok' => true,
            'wallet' => $wallet
        ], 201);
    }

    public function show($id)
    {
        $wallet = Wallet::with('user')->findOrFail($id);
        return response()->json($wallet, 200);
    }


    public function update(Request $request, $id)
    {
        $request->validate([
            'monto' => 'required|numeric',
            'motivo' => 'required|string|max:255'
        ]);

        DB::beginTransaction();

        try {
            $wallet = Wallet::lockForUpdate()->findOrFail($id);

            $monto = (float) $request->monto;
            $saldoAnterior = $wallet->saldo;
            $saldoNuevo = $saldoAnterior + $monto;

            if ($saldoNuevo < 0) {
                return response()->json(['message' => 'Fondos insuficientes para realizar este ajuste (Resta).'], 400);
            }

            $wallet->saldo = $saldoNuevo;
            $wallet->save();

            $tipo = $monto >= 0 ? 'deposit' : 'withdraw';

            Transaccion::create([
                'wallet_id'      => $wallet->id,
                'tipo'           => $tipo,
                'monto'          => abs($monto),
                'saldo_anterior' => $saldoAnterior,
                'saldo_nuevo'    => $saldoNuevo,
                'estado'         => 'APROBADO',
                'descripcion'    => 'Ajuste Manual Admin: ' . $request->motivo,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Saldo ajustado correctamente.',
                'wallet' => $wallet
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al ajustar saldo', 'error' => $e->getMessage()], 500);
        }
    }
}
