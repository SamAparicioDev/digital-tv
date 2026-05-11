<?php

namespace App\Http\Controllers;

use App\Models\CompraCredencial;
use Illuminate\Http\Request;

class MisCuentasController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $credenciales = CompraCredencial::with([
            'cuenta.streamingService',
            'perfil',
            'compra.oferta.servicios',
        ])
        ->where(function ($q) use ($user) {
            // Via compra aprobada
            $q->whereHas('compra', fn($q2) =>
                $q2->where('user_id', $user->id)->where('estado', 'aprobada')
            )
            // O asignación manual directa
            ->orWhere('user_id', $user->id);
        })
        ->orderBy('vigencia_hasta', 'desc')
        ->get();

        $data = $credenciales->map(function ($c) {
            $esCuentaCompleta = $c->perfil_id === null;
            $servicio         = $c->cuenta?->streamingService;
            $hoy              = now()->toDateString();
            $vigente          = $c->vigencia_hasta >= $hoy;

            return [
                'id'             => $c->id,
                'compra_id'      => $c->compra_id,
                'tipo'           => $esCuentaCompleta ? 'cuenta_completa' : 'perfil',
                'servicio'       => $servicio?->name ?? 'Desconocido',
                'servicio_color' => $servicio?->primary_color ?? '#6B7280',
                'servicio_logo'  => $servicio?->logo_url,
                'email'          => $c->cuenta?->email,
                'password'       => $esCuentaCompleta ? $c->cuenta?->password : null,
                'perfil'         => $c->perfil ? ['nombre' => $c->perfil->nombre, 'pin' => $c->perfil->pin] : null,
                'vigencia_desde' => $c->vigencia_desde,
                'vigencia_hasta' => $c->vigencia_hasta,
                'vigente'        => $vigente,
                'dias_restantes' => max(0, now()->diffInDays($c->vigencia_hasta, false)),
                'es_asignacion_manual' => $c->compra_id === null,
            ];
        });

        return response()->json($data);
    }
}
