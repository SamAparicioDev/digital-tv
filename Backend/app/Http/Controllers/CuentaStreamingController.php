<?php

namespace App\Http\Controllers;

use App\Models\CuentaStreaming;
use App\Models\PerfilStreaming;
use Illuminate\Http\Request;

class CuentaStreamingController extends Controller
{
    /** Admin: listado de todas las cuentas con sus perfiles y estado de asignación */
    public function index()
    {
        $cuentas = CuentaStreaming::with([
            'streamingService',
            'perfiles.credencial',
            'credencial',
        ])
        ->orderBy('streaming_service_id')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(fn($c) => $this->formatCuenta($c));

        return response()->json($cuentas);
    }

    /** Admin: crear cuenta (con perfiles opcionales inline) */
    public function store(Request $request)
    {
        $data = $request->validate([
            'streaming_service_id'   => 'required|exists:streaming_services,id',
            'email'                  => 'required|string|max:255',
            'password'               => 'required|string|max:255',
            'descripcion'            => 'nullable|string|max:1000',
            'vigencia_hasta'         => 'nullable|date',
            'is_active'              => 'boolean',
            'perfiles'               => 'nullable|array',
            'perfiles.*.nombre'      => 'required|string|max:100',
            'perfiles.*.pin'         => 'nullable|string|max:10',
        ]);

        $perfilesData = $data['perfiles'] ?? [];
        unset($data['perfiles']);

        $cuenta = CuentaStreaming::create($data);

        foreach ($perfilesData as $p) {
            $cuenta->perfiles()->create([
                'nombre' => $p['nombre'],
                'pin'    => $p['pin'] ?? null,
            ]);
        }

        $cuenta->load(['streamingService', 'perfiles.credencial', 'credencial']);
        return response()->json($this->formatCuenta($cuenta), 201);
    }

    /** Admin: actualizar cuenta */
    public function update(Request $request, CuentaStreaming $cuenta)
    {
        $data = $request->validate([
            'email'          => 'sometimes|string|max:255',
            'password'       => 'sometimes|string|max:255',
            'descripcion'    => 'nullable|string|max:1000',
            'vigencia_hasta' => 'nullable|date',
            'is_active'      => 'boolean',
        ]);

        $cuenta->update($data);
        $cuenta->load(['streamingService', 'perfiles.credencial', 'credencial']);

        return response()->json($this->formatCuenta($cuenta));
    }

    /** Admin: eliminar cuenta */
    public function destroy(CuentaStreaming $cuenta)
    {
        $cuenta->delete();
        return response()->json(['ok' => true]);
    }

    /** Admin: agregar perfil a una cuenta */
    public function storePerfil(Request $request, CuentaStreaming $cuenta)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'pin'    => 'nullable|string|max:10',
        ]);

        $perfil = $cuenta->perfiles()->create($data);
        $perfil->load('credencial');

        return response()->json([
            'id'          => $perfil->id,
            'nombre'      => $perfil->nombre,
            'pin'         => $perfil->pin,
            'is_active'   => $perfil->is_active,
            'disponible'  => !$perfil->credencial,
        ], 201);
    }

    /** Admin: eliminar perfil */
    public function destroyPerfil(PerfilStreaming $perfil)
    {
        $perfil->delete();
        return response()->json(['ok' => true]);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function formatCuenta(CuentaStreaming $c): array
    {
        $perfilesTotal     = $c->perfiles->count();
        $perfilesAsignados = $c->perfiles->filter(fn($p) => $p->credencial !== null)->count();

        // credencial con perfil_id IS NULL = cuenta vendida como un todo
        $cuentaAsignada = $c->credencial !== null;

        // Disponible como cuenta completa: activa + sin asignación de cuenta completa
        $disponibleComoCompleta = $c->is_active && !$cuentaAsignada;

        return [
            'id'                      => $c->id,
            'streaming_service_id'    => $c->streaming_service_id,
            'streaming_service'       => $c->streamingService ? [
                'id'            => $c->streamingService->id,
                'name'          => $c->streamingService->name,
                'primary_color' => $c->streamingService->primary_color,
                'logo_url'      => $c->streamingService->logo_url,
            ] : null,
            'email'                   => $c->email,
            'password'                => $c->password,
            'descripcion'             => $c->descripcion,
            'vigencia_hasta'          => $c->vigencia_hasta,
            'is_active'               => $c->is_active,
            'cuenta_asignada'         => $cuentaAsignada,
            'disponible_como_completa'=> $disponibleComoCompleta,
            'perfiles_total'          => $perfilesTotal,
            'perfiles_disponibles'    => $perfilesTotal - $perfilesAsignados,
            'perfiles'                => $c->perfiles->map(fn($p) => [
                'id'         => $p->id,
                'nombre'     => $p->nombre,
                'pin'        => $p->pin,
                'is_active'  => $p->is_active,
                'disponible' => $p->credencial === null,
            ]),
        ];
    }
}
