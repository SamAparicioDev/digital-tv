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
            'password' => 'required|confirmed|string|min:6|max:30',
            'phone'    => 'required|string|max:30',
        ]);

        return DB::transaction(function () use ($request) {

            $usuario = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'phone'    => $request->phone,
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

        if (!$usuario->is_active) {
            Auth::guard('web')->logout();
            return response()->json([
                'ok'    => false,
                'error' => 'Tu cuenta está desactivada. Contacta al administrador.',
            ], 403);
        }


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

    /** PUT /api/profile — actualizar nombre, email y teléfono */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['ok' => false, 'message' => 'No autenticado'], 401);

        $data = $request->validate([
            'name'  => 'sometimes|required|string|max:50',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:30',
        ]);

        $user->update($data);

        return response()->json([
            'ok'      => true,
            'message' => 'Perfil actualizado correctamente',
            'user'    => $user->fresh()->load('roles', 'wallet'),
        ]);
    }

    /** PUT /api/profile/password — cambiar contraseña verificando la actual */
    public function changePassword(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['ok' => false, 'message' => 'No autenticado'], 401);

        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'ok'      => false,
                'message' => 'La contraseña actual es incorrecta',
            ], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json([
            'ok'      => true,
            'message' => 'Contraseña actualizada correctamente',
        ]);
    }
}
