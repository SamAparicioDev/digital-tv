<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\Transaccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransaccionController extends Controller
{
    // Obtener todas las transacciones del usuario autenticado
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

    // Registrar una transacción: ingreso o gasto
    public function store(Request $request)
    {
        $request->validate([
            'tipo'  => 'required|in:ingreso,gasto',
            'valor' => 'required|numeric|min:0.01'
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {

            // Obtener wallet del usuario (con bloqueo para evitar errores)
            $wallet = Wallet::where('user_id', $user->id)
                ->lockForUpdate()
                ->firstOrFail();

            $valor = $request->valor;
            $tipo  = $request->tipo;

            // Validación si es gasto y no tiene saldo suficiente
            if ($tipo === 'gasto') {
                if ($wallet->saldo < $valor) {
                    return response()->json([
                        'error' => 'Saldo insuficiente'
                    ], 422);
                }

                $wallet->saldo -= $valor;
            } else {
                $wallet->saldo += $valor;
            }

            $wallet->save();

            // Registrar la transacción
            $transaccion = Transaccion::create([
                'wallet_id' => $wallet->id,
                'tipo'      => $tipo,
                'valor'     => $valor
            ]);

            return response()->json([
                'message'      => 'Transacción registrada correctamente',
                'wallet'       => $wallet,
                'transaccion'  => $transaccion
            ], 201);
        });
    }
}
