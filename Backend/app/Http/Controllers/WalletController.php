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
        if (!Auth::user()->hasPrivilege('gestionar_usuarios')) {
             return response()->json(['message' => 'No autorizado.'], 403);
        }

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
                'wallet_id' => $wallet->id,
                'tipo' => 'ingreso',
                'monto' => $request->saldo,
                'saldo_anterior' => 0,
                'saldo_nuevo' => $request->saldo,
                'estado' => 'aprobada',
                'descripcion' => 'Saldo inicial por creación manual',
                'referencia' => 'INIT-ADMIN-' . Auth::id()
            ]);
        }

        return response()->json([
            'ok' => true,
            'wallet' => $wallet
        ], 201);
    }

    public function show($id)
    {
        $user = Auth::user();
        $wallet = Wallet::with('user')->findOrFail($id);

        if ($wallet->user_id !== $user->id && !$user->hasPrivilege('gestionar_usuarios')) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($wallet, 200);
    }


    public function update(Request $request, $id)
    {
        if (!Auth::user()->hasPrivilege('gestionar_usuarios')) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

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

            $tipo = $monto >= 0 ? 'ingreso' : 'egreso';

            Transaccion::create([
                'wallet_id' => $wallet->id,
                'tipo' => $tipo,
                'monto' => abs($monto),
                'saldo_anterior' => $saldoAnterior,
                'saldo_nuevo' => $saldoNuevo,
                'estado' => 'aprobada',
                'descripcion' => 'Ajuste Manual Admin: ' . $request->motivo,
                'referencia' => 'ADJ-' . time() . '-' . Auth::id()
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
