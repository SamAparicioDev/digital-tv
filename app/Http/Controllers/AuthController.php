<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Rol; // ✅ Necesario para asignar rol por defecto

class AuthController extends Controller
{
    /**
     * Registro de nuevo usuario (Cliente).
     */
    public function registrar(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:50',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|confirmed|string|min:8|max:30',
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Crear Usuario
            $usuario = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => $request->password, // El modelo se encarga del Hashing en 'casts'
            ]);

            // 2. Crear Wallet Inicial
            Wallet::create([
                'user_id' => $usuario->id,
                'saldo'   => 0
            ]);

            // 3. ✅ Asignar Rol por defecto ("Cliente")
            // Asegúrate de crear este rol en tu base de datos primero
            $rolCliente = Rol::where('nombre', 'Cliente')->first();
            if ($rolCliente) {
                $usuario->roles()->attach($rolCliente->id);
            }

            // 4. ✅ Generar Token inmediatamente (Auto-login)
            $token = $usuario->createToken('auth_token')->plainTextToken;

            return response()->json([
                'ok'      => true,
                'message' => 'Usuario registrado exitosamente',
                'user'    => $usuario->load('roles', 'wallet'), // Devolvemos info completa
                'token'   => $token
            ], 201);
        });
    }

    /**
     * Inicio de sesión.
     */
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

        // Eliminar tokens anteriores si quieres sesión única (Opcional)
        // $usuario->tokens()->delete();

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'ok'      => true,
            'message' => 'Bienvenido al sistema',
            'user'    => $usuario->load('roles', 'wallet'), // Cargamos roles y saldo para el frontend
            'token'   => $token,
        ]);
    }

    /**
     * Cierre de sesión (Revocar token).
     */
    public function logout(Request $request)
    {
        // Elimina el token que se usó para esta petición
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'ok' => true,
            'message' => 'Sesión cerrada correctamente'
        ], 200);
    }
}
