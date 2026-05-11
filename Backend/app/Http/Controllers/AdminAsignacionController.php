<?php

namespace App\Http\Controllers;

use App\Models\CompraCredencial;
use App\Models\CuentaStreaming;
use App\Models\PerfilStreaming;
use App\Models\User;
use Illuminate\Http\Request;

class AdminAsignacionController extends Controller
{
    /** Lista credenciales asignadas manualmente (sin compra) */
    public function index()
    {
        $creds = CompraCredencial::with(['cuenta.streamingService', 'perfil', 'user'])
            ->whereNull('compra_id')
            ->whereNotNull('user_id')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($creds);
    }

    /** Asignar credencial directamente a un usuario sin pasar por el flujo de compra */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'        => 'required|exists:users,id',
            'cuenta_id'      => 'nullable|exists:cuentas_streaming,id',
            'perfil_id'      => 'nullable|exists:perfiles_streaming,id',
            'vigencia_desde' => 'required|date',
            'vigencia_hasta' => 'required|date|after_or_equal:vigencia_desde',
        ]);

        if (!$data['cuenta_id'] && !$data['perfil_id']) {
            return response()->json(['message' => 'Selecciona una cuenta completa o un perfil.'], 422);
        }

        // Si se da un perfil, obtener la cuenta padre
        if (!empty($data['perfil_id']) && empty($data['cuenta_id'])) {
            $perfil = PerfilStreaming::findOrFail($data['perfil_id']);
            $data['cuenta_id'] = $perfil->cuenta_id;
        }

        $credencial = CompraCredencial::create([
            'compra_id'      => null,
            'user_id'        => $data['user_id'],
            'cuenta_id'      => $data['cuenta_id'],
            'perfil_id'      => $data['perfil_id'] ?? null,
            'vigencia_desde' => $data['vigencia_desde'],
            'vigencia_hasta' => $data['vigencia_hasta'],
        ]);

        return response()->json(
            $credencial->load(['cuenta.streamingService', 'perfil', 'user']),
            201
        );
    }

    /** Revocar una asignación manual */
    public function destroy(CompraCredencial $credencial)
    {
        if ($credencial->compra_id !== null) {
            return response()->json(['message' => 'Solo se pueden revocar asignaciones manuales.'], 403);
        }
        $credencial->delete();
        return response()->json(['ok' => true]);
    }
}
