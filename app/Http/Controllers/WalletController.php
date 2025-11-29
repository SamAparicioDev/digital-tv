<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    /**
     * Crear wallet
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id|unique:users,id',
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
            'saldo'   => $request->saldo
        ]);

        return response()->json([
            'ok' => true,
            'wallet' => $wallet
        ], 201);
    }

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

        return DB::transaction(function () use ($user_id, $request) {

            $wallet = Wallet::where('user_id', $user_id)->lockForUpdate()->first();

            if (!$wallet) {
                return response()->json([
                    'ok' => false,
                    'message' => 'Wallet not found'
                ], 404);
            }

            $amount = (float) $request->amount;
            $newBalance = (float) $wallet->saldo + $amount; // amount can be negative to subtract

            if ($newBalance < 0) {
                return response()->json([
                    'ok' => false,
                    'message' => 'Insufficient funds'
                ], 400);
            }

            $wallet->saldo = $newBalance;
            $wallet->save();

            return response()->json([
                'ok' => true,
                'wallet' => $wallet
            ]);
        });
    }
}
