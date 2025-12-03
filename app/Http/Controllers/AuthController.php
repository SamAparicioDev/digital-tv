<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Rol; 

class AuthController extends Controller
{

    public function registrar(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:50',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|confirmed|string|min:8|max:30',
        ]);

        return DB::transaction(function () use ($request) {

            $usuario = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => $request->password,
            ]);

            Wallet::create([
                'user_id' => $usuario->id,
                'saldo'   => 0
            ]);


            $rolCliente = Rol::where('nombre', 'Cliente')->first();
            if ($rolCliente) {
                $usuario->roles()->attach($rolCliente->id);
            }

            $token = $usuario->createToken('auth_token')->plainTextToken;

            return response()->json([
                'ok'      => true,
                'message' => 'Usuario registrado exitosamente',
                'user'    => $usuario->load('roles', 'wallet'),
                'token'   => $token
            ], 201);
        });
    }

    public function ingresar(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'ok'    => false,
                'error' => 'Credenciales inválidas'
            ], 401);
        }

        $usuario = Auth::user();


        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'ok'      => true,
            'message' => 'Bienvenido al sistema',
            'user'    => $usuario->load('roles', 'wallet'), // Cargamos roles y saldo para el frontend
            'token'   => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'ok' => true,
            'message' => 'Sesión cerrada correctamente'
        ], 200);
    }
}
