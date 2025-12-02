<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckPrivilege
{
    public function handle(Request $request, Closure $next, string $privilegioRequerido): Response
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $user = Auth::user();

        // 1. Super Admin siempre pasa (Backdoor de seguridad opcional pero recomendado)
        // Asumiendo que existe un rol maestro que puede hacer todo
        if ($user->hasRole('Super Admin')) {
            return $next($request);
        }

        // 2. Verificamos el privilegio específico usando el método que creamos en el User Model
        // Puedes permitir múltiples separados por pipe si lo deseas: 'ver_oferta|editar_oferta'
        $privilegios = explode('|', $privilegioRequerido);

        $tienePermiso = false;
        foreach ($privilegios as $priv) {
            if ($user->hasPrivilege($priv)) {
                $tienePermiso = true;
                break;
            }
        }

        if (!$tienePermiso) {
            return response()->json([
                'message' => 'Acceso denegado. No tienes el privilegio requerido.',
                'requiere' => $privilegioRequerido
            ], 403);
        }

        return $next($request);
    }
}
