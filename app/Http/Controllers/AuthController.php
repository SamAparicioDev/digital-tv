<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\HasApiTokens;


class AuthController extends Controller
{
    public function registrar(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:25',
            'password' => 'required|confirmed|string|max:30|min:8',
            'email' => 'required|email|unique:users,email'
        ]);

        $usuario = User::create(['name' => $request->name, 'password' => $request->password, 'email' => $request->email]);

        return response()->json($usuario, 201);
    }

    public function ingresar(Request $request)
    {

        $request->validate([
            'email'    => 'required|email|exists:users,email',
            'password' => 'required|string|max:30|min:8'
        ]);

        // Try to authenticate the user
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Auth::attempt found the user and validated the password
        $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;


        return response()->json([
            'message' => 'Login successful',
            'user'    => $user,
            'token'  => $token
        ]);
    }
}
