<?php

namespace App\Http\Controllers;

use App\Models\Transaccion;
use App\Models\Compra;
use App\Models\CuentaStreaming;
use App\Models\PerfilStreaming;
use App\Models\CompraCredencial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminTransaccionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaccion::with(['wallet.user', 'compra.oferta', 'metodoPago']);

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function update(Request $request, Transaccion $transaccion)
    {
        $request->validate([
            'estado'           => ['required', Rule::in(['APROBADO', 'RECHAZADO', 'PENDIENTE'])],
            'comentario_admin' => 'nullable|string|max:255',
        ]);

        $nuevoEstado  = strtoupper($request->estado);
        $estadoActual = strtoupper($transaccion->estado);

        if ($estadoActual !== 'PENDIENTE' && $nuevoEstado !== $estadoActual) {
            return response()->json(['message' => 'Esta transacción ya fue procesada anteriormente.'], 409);
        }

        DB::beginTransaction();

        try {
            $wallet = $transaccion->wallet()->lockForUpdate()->first();
            $saldoAlMomentoDeOperar = $wallet->saldo;
            $tipoTransaccion = $transaccion->tipo;
            $compra = Compra::where('transaccion_id', $transaccion->id)->first();

            if ($tipoTransaccion === 'deposit') {
                if ($nuevoEstado === 'APROBADO') {
                    $wallet->saldo += $transaccion->monto;
                    $wallet->save();
                    $transaccion->saldo_anterior = $saldoAlMomentoDeOperar;
                    $transaccion->saldo_nuevo    = $wallet->saldo;
                }
            } else {
                // withdraw (compra)
                if ($nuevoEstado === 'APROBADO') {
                    if ($compra) {
                        $compra->update(['estado' => 'aprobada']);
                        $this->asignarCredenciales($compra);
                    }
                } elseif ($nuevoEstado === 'RECHAZADO') {
                    $wallet->saldo += $transaccion->monto;
                    $wallet->save();

                    if ($compra) {
                        $compra->update(['estado' => 'rechazada']);
                        $compra->oferta->increment('stock');
                    }
                    $transaccion->saldo_anterior = $saldoAlMomentoDeOperar;
                    $transaccion->saldo_nuevo    = $wallet->saldo;
                }
            }

            $transaccion->estado      = $nuevoEstado;
            $transaccion->descripcion = $transaccion->descripcion
                . ($request->comentario_admin ? ' | Nota Admin: ' . $request->comentario_admin : '');
            $transaccion->save();

            DB::commit();

            return response()->json([
                'message'              => "Transacción actualizada a {$nuevoEstado} correctamente.",
                'transaccion'          => $transaccion->fresh(),
                'saldo_actual_usuario' => $wallet->saldo,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar la transacción.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Transaccion $transaccion)
    {
        return response()->json($transaccion->load(['wallet.user', 'compra.oferta', 'metodoPago']), 200);
    }

    // ── Asignación de credenciales ────────────────────────────────────────────

    private function asignarCredenciales(Compra $compra): void
    {
        // Evitar doble asignación
        if (CompraCredencial::where('compra_id', $compra->id)->exists()) return;

        $oferta = $compra->oferta()->with('servicios')->first();
        if (!$oferta) return;

        $servicio = $oferta->servicios->first();
        if (!$servicio) return;

        $duracionDias  = $servicio->pivot->duracion_dias ?? 30;
        $vigenciaDesde = now()->toDateString();
        $vigenciaHasta = now()->addDays($duracionDias)->toDateString();

        if ($oferta->cuenta_completa) {
            // Asignar cuenta completa sin perfiles asignados
            $cuenta = CuentaStreaming::where('streaming_service_id', $servicio->id)
                ->where('is_active', true)
                ->whereDoesntHave('credencial')
                ->first();

            if ($cuenta) {
                CompraCredencial::create([
                    'compra_id'      => $compra->id,
                    'cuenta_id'      => $cuenta->id,
                    'perfil_id'      => null,
                    'vigencia_desde' => $vigenciaDesde,
                    'vigencia_hasta' => $vigenciaHasta,
                ]);
                $compra->update(['datos_acceso' => json_encode([
                    'tipo'            => 'cuenta_completa',
                    'email'           => $cuenta->email,
                    'password'        => $cuenta->password,
                    'vigencia_hasta'  => $vigenciaHasta,
                ])]);
            }
        } else {
            // Asignar un perfil disponible de la cuenta correcta
            $perfil = PerfilStreaming::where('is_active', true)
                ->whereDoesntHave('credencial')
                ->whereHas('cuenta', fn($q) =>
                    $q->where('streaming_service_id', $servicio->id)->where('is_active', true)
                )
                ->first();

            if ($perfil) {
                CompraCredencial::create([
                    'compra_id'      => $compra->id,
                    'cuenta_id'      => $perfil->cuenta_id,
                    'perfil_id'      => $perfil->id,
                    'vigencia_desde' => $vigenciaDesde,
                    'vigencia_hasta' => $vigenciaHasta,
                ]);
                $compra->update(['datos_acceso' => json_encode([
                    'tipo'           => 'perfil',
                    'email'          => $perfil->cuenta->email,
                    'perfil_nombre'  => $perfil->nombre,
                    'perfil_pin'     => $perfil->pin,
                    'vigencia_hasta' => $vigenciaHasta,
                ])]);
            }
        }
    }
}
