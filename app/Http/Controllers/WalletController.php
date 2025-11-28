<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WalletController extends Controller
{
    /**
     * Crear una nueva wallet para un usuario.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'saldo'   => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'ok' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $wallet = Wallet::create([
            'user_id' => $request->user_id,
            'saldo'   => $request->saldo // se convierte automáticamente a centavos
        ]);

        return response()->json([
            'ok' => true,
            'wallet' => $wallet
        ]);
    }


    /**
     * Obtener wallet por ID de usuario.
     */
    public function showByUser($user_id)
    {
        $wallet = Wallet::where('user_id', $user_id)->first();

        if (!$wallet) {
            return response()->json([
                'ok' => false,
                'message' => 'Wallet not found'
            ], 404);
        }

        return response()->json([
            'ok' => true,
            'wallet' => $wallet
        ]);
    }


    /**
     * Actualizar saldo (sumar o restar).
     */
    public function updateSaldo(Request $request, $user_id)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'ok' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $wallet = Wallet::where('user_id', $user_id)->first();

        if (!$wallet) {
            return response()->json([
                'ok' => false,
                'message' => 'Wallet not found'
            ], 404);
        }

        // Convertimos la cantidad del request a centavos
        $amountCents = intval(round($request->amount * 100));

        $newBalance = $wallet->saldo_cents + $amountCents;

        // No permitir saldo negativo
        if ($newBalance < 0) {
            return response()->json([
                'ok' => false,
                'message' => 'Insufficient funds'
            ], 400);
        }

        // Guardar
        $wallet->saldo_cents = $newBalance;
        $wallet->save();

        return response()->json([
            'ok' => true,
            'wallet' => $wallet
        ]);
    }
}
