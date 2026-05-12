<?php

namespace App\Http\Controllers;

use App\Models\Compra;
use App\Models\Oferta;
use App\Models\Transaccion;
use App\Models\CompraCredencial;
use App\Models\CuentaStreaming;
use App\Models\PerfilStreaming;
use App\Models\StreamingService;
use App\Models\Descuento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CompraController extends Controller
{

    public function index()
    {
        $user = Auth::user();

        if (!$user) {
             return response()->json(['message' => 'No estás autenticado. Token no válido o ausente.'], 401);
        }

        $compras = Compra::with(['oferta.servicios', 'transaccion'])
                         ->where('user_id', $user->id)
                         ->orderBy('created_at', 'desc')
                         ->get();

        return response()->json($compras, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'oferta_id' => ['required', 'integer', Rule::exists('ofertas', 'id')->where('is_active', true)],
            'nota' => 'nullable|string|max:500'
        ]);

        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Usuario no autenticado. Por favor, inicia sesión y envía tu token.'], 401);
        }

        if (!$user->wallet) {
            return response()->json(['message' => 'El usuario no tiene una billetera activa. Contacta soporte.'], 400);
        }

        DB::beginTransaction();

        try {
            $oferta = Oferta::where('id', $request->oferta_id)
                ->with('servicios')
                ->lockForUpdate()
                ->first();

            // Stock calculado desde cuentas/perfiles reales sin asignar
            $stockDisponible = $this->computarStock($oferta);
            if ($stockDisponible <= 0) {
                DB::rollBack();
                return response()->json(['message' => 'Lo sentimos, esta oferta se ha agotado.'], 409);
            }

            // Aplicar descuentos según rol del usuario y servicios de la oferta
            $precioFinal = $this->precioConDescuento($oferta, $user);

            if ($user->wallet->saldo < $precioFinal) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Saldo insuficiente para realizar esta compra.',
                    'saldo_actual' => $user->wallet->saldo,
                    'precio_oferta' => $precioFinal,
                ], 402);
            }

            $saldoAnterior = $user->wallet->saldo;
            $saldoNuevo    = $saldoAnterior - $precioFinal;

            $nombreOferta = $oferta->servicios->map(fn($s) => $s->name)->implode(' + ') ?: 'Oferta #' . $oferta->id;
            $descSuffix   = $precioFinal < $oferta->precio
                ? " (con descuento desde \${$oferta->precio})"
                : '';

            $transaccion = Transaccion::create([
                'wallet_id'      => $user->wallet->id,
                'tipo'           => 'withdraw',
                'estado'         => 'APROBADO',
                'monto'          => $precioFinal,
                'saldo_anterior' => $saldoAnterior,
                'saldo_nuevo'    => $saldoNuevo,
                'descripcion'    => "Compra aprobada: {$nombreOferta}{$descSuffix}",
            ]);

            $compra = Compra::create([
                'user_id'        => $user->id,
                'oferta_id'      => $oferta->id,
                'transaccion_id' => $transaccion->id,
                'precio_compra'  => $precioFinal,
                'estado'         => 'aprobada',
                'nota'           => $request->nota,
            ]);

            // No se decrementa stock manual: se calcula desde cuentas disponibles
            $user->wallet->decrement('saldo', $precioFinal);

            // Asignar credenciales automáticamente
            $this->asignarCredenciales($compra);

            DB::commit();

            $compra->load(['oferta.servicios']);

            return response()->json([
                'message' => '¡Compra exitosa! Tus credenciales ya están disponibles.',
                'compra'  => $compra,
                'saldo_nuevo' => $saldoNuevo,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al procesar la compra.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function show(Compra $compra)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        if ($compra->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado para ver esta compra'], 403);
        }

        return response()->json($compra->load(['oferta.servicios', 'transaccion']), 200);
    }

    /**
     * Calcula el MEJOR precio aplicable considerando descuentos activos.
     *
     * REGLAS (los descuentos NO se acumulan):
     *  1. Filtra descuentos activos, vigentes y que apliquen al servicio de la oferta.
     *  2. Dentro de cada descuento, evalúa todos los valores aplicables al usuario
     *     (rol activo + valor_global) y se queda con el que produzca menor precio.
     *  3. Entre todos los descuentos, devuelve el que produzca el MENOR precio final.
     *     Si un descuento es 30% y otro es $5000 pesos fijos, gana el que reste más.
     */
    private function precioConDescuento(Oferta $oferta, $user): float
    {
        $precioOriginal = (float) $oferta->precio;
        $servicioIds    = $oferta->servicios->pluck('id')->toArray();
        if (empty($servicioIds)) return $precioOriginal;

        $now         = now();
        $userRoleIds = $user->roles()->pluck('rol.id')->toArray();
        $mejorPrecio = $precioOriginal;

        $descuentos = Descuento::where('is_active', true)
            ->where('fecha_inicio', '<=', $now)
            ->where(function ($q) use ($now) {
                $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', $now);
            })
            ->with(['streamingServices', 'roles'])
            ->get();

        foreach ($descuentos as $d) {
            // ── Filtro: servicios del descuento deben coincidir con los de la oferta ─
            $dServicios = $d->streamingServices->pluck('id')->toArray();
            if (count($dServicios) > 0 && empty(array_intersect($servicioIds, $dServicios))) continue;

            // ── Recolectar candidatos (rol + global) ──────────────────────────────
            $candidatos = [];

            // 1) Valor por rol del usuario
            if (!empty($userRoleIds) && $d->roles->count() > 0) {
                $roleDesc = $d->roles->whereIn('id', $userRoleIds)->first();
                if ($roleDesc && ($roleDesc->pivot->is_active ?? true) && (float) $roleDesc->pivot->valor_descuento > 0) {
                    $candidatos[] = [
                        'valor' => (float) $roleDesc->pivot->valor_descuento,
                        'tipo'  => $roleDesc->pivot->tipo_descuento,
                    ];
                }
            }

            // 2) Valor global
            if ($d->valor_global !== null && (float) $d->valor_global > 0) {
                $candidatos[] = [
                    'valor' => (float) $d->valor_global,
                    'tipo'  => $d->tipo_global ?? 'porcentaje',
                ];
            }

            if (empty($candidatos)) continue;

            // ── Mejor candidato DENTRO de este descuento ──────────────────────────
            $mejorPrecioEnDescuento = $precioOriginal;
            foreach ($candidatos as $c) {
                $pf = $c['tipo'] === 'porcentaje'
                    ? max(0, $precioOriginal * (1 - $c['valor'] / 100))
                    : max(0, $precioOriginal - $c['valor']);
                if ($pf < $mejorPrecioEnDescuento) {
                    $mejorPrecioEnDescuento = $pf;
                }
            }

            // ── Comparar con el mejor global ──────────────────────────────────────
            if ($mejorPrecioEnDescuento < $mejorPrecio) {
                $mejorPrecio = $mejorPrecioEnDescuento;
            }
        }

        return round($mejorPrecio, 2);
    }

    private function computarStock(Oferta $oferta): int
    {
        $servicio = $oferta->servicios->first();
        if (!$servicio) return 0;

        if ($oferta->cuenta_completa) {
            return CuentaStreaming::where('streaming_service_id', $servicio->id)
                ->where('is_active', true)
                ->whereDoesntHave('credencial')
                ->count();
        }

        return PerfilStreaming::where('is_active', true)
            ->whereDoesntHave('credencial')
            ->whereHas('cuenta', fn($q) =>
                $q->where('streaming_service_id', $servicio->id)
                  ->where('is_active', true)
                  ->whereDoesntHave('credencial')
            )
            ->count();
    }

    private function asignarCredenciales(Compra $compra): void
    {
        if (CompraCredencial::where('compra_id', $compra->id)->exists()) return;

        $oferta   = $compra->oferta()->with('servicios')->first();
        if (!$oferta) return;

        $servicio = $oferta->servicios->first();
        if (!$servicio) return;

        $duracionDias  = $servicio->pivot->duracion_dias ?? 30;
        $vigenciaDesde = now()->toDateString();
        $vigenciaHasta = now()->addDays($duracionDias)->toDateString();

        if ($oferta->cuenta_completa) {
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
                    'tipo'           => 'cuenta_completa',
                    'email'          => $cuenta->email,
                    'password'       => $cuenta->password,
                    'vigencia_hasta' => $vigenciaHasta,
                ])]);
            }
        } else {
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
