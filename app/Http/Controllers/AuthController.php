<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Wallet;

class AuthController extends Controller
{
    public function registrar(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:25',
            'password' => 'required|confirmed|string|max:30|min:8',
            'email'    => 'required|email|unique:users,email'
        ]);

        return DB::transaction(function () use ($request) {

            $usuario = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => $request->password
            ]);

            Wallet::create([
                'user_id' => $usuario->id,
                'saldo'   => 0
            ]);

            return response()->json([
                'ok'     => true,
                'user'   => $usuario,
                'wallet' => $usuario->wallet
            ], 201);
        });
    }

    public function ingresar(Request $request)
    {
        $request->validate([
            'email'    => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|max:30'
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'ok'    => false,
                'error' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'ok'     => true,
            'message'=> 'Login successful',
            'user'   => $user,
            'token'  => $token,
        ]);
    }
}
