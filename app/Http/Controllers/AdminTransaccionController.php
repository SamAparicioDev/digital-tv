<?php

namespace App\Http\Controllers;

use App\Models\Transaccion;
use App\Models\Compra;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminTransaccionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaccion::with(['wallet.user', 'compra.oferta']);

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Actualizar el estado de una transacción (Aprobar/Rechazar).
     */
    public function update(Request $request, Transaccion $transaccion)
    {
        $request->validate([
            'estado' => ['required', Rule::in(['aprobada', 'rechazada', 'pendiente', 'APROBADO', 'RECHAZADO', 'PENDIENTE'])],
            'comentario_admin' => 'nullable|string|max:255'
        ]);

        $nuevoEstado = strtolower($request->estado);
        $estadoActual = strtolower($transaccion->estado);

        // Validación: No tocar lo que ya está finalizado
        if ($estadoActual !== 'pendiente' && $nuevoEstado !== $estadoActual) {
            return response()->json([
                'message' => 'Esta transacción ya fue procesada anteriormente.'
            ], 409);
        }

        DB::beginTransaction();

        try {
            // 🔒 BLOQUEO PESIMISTA:
            // Bloqueamos la billetera para que nadie más modifique el saldo mientras hacemos cálculos.
            // Esto es vital cuando hay múltiples aprobaciones simultáneas.
            $wallet = $transaccion->wallet()->lockForUpdate()->first();

            // 1. Tomamos la "foto" del saldo exacto en ESTE momento (antes de aprobar/rechazar)
            $saldoAlMomentoDeOperar = $wallet->saldo;

            $tipoTransaccion = strtolower($transaccion->tipo); // 'ingreso', 'egreso' o 'retiro'
            $compra = Compra::where('transaccion_id', $transaccion->id)->first();

            // =========================================================
            // LÓGICA DE RECARGAS (INGRESOS)
            // =========================================================
            if ($tipoTransaccion === 'ingreso') {
                if ($nuevoEstado === 'aprobada') {
                    // Sumamos el dinero
                    $wallet->saldo += $transaccion->monto;
                    $wallet->save();

                    // 🚨 ACTUALIZACIÓN DE HISTORIAL (Tu observación):
                    // Como el dinero entra AHORA, actualizamos el registro para que el 'saldo_anterior'
                    // sea el que tenía el usuario hace 1 milisegundo, no hace 3 días cuando la pidió.
                    $transaccion->saldo_anterior = $saldoAlMomentoDeOperar;
                    $transaccion->saldo_nuevo    = $wallet->saldo; // El nuevo saldo sumado
                }
                // Si se rechaza un ingreso, no se toca el saldo, y los históricos quedan igual (irrelevantes).
            }

            // =========================================================
            // LÓGICA DE COMPRAS/RETIROS (EGRESOS)
            // =========================================================
            else {
                // Recordemos: En egresos, el dinero YA SE DESCONTÓ al crear la petición ('congelado').

                if ($nuevoEstado === 'aprobada') {
                    if ($compra) $compra->update(['estado' => 'aprobada']);

                    // En egresos aprobados, NO cambiamos los saldos históricos.
                    // ¿Por qué? Porque el descuento ocurrió realmente en el pasado (al crear la petición).
                    // Esa "foto" histórica sigue siendo válida: "El día X tenías 100 y te quité 20".
                }
                elseif ($nuevoEstado === 'rechazada') {
                    // REEMBOLSO: Devolvemos el dinero
                    $wallet->saldo += $transaccion->monto;
                    $wallet->save();

                    if ($compra) {
                        $compra->update(['estado' => 'rechazada']);
                        $compra->oferta->increment('stock');
                    }

                    // 🚨 ACTUALIZACIÓN DE HISTORIAL EN REEMBOLSO:
                    // Aquí SÍ actualizamos, porque estamos creando un movimiento "inverso" (devolución).
                    // Reflejamos que el saldo subió de nuevo.
                    $transaccion->saldo_anterior = $saldoAlMomentoDeOperar;
                    $transaccion->saldo_nuevo    = $wallet->saldo;
                }
            }

            // =========================================================
            // GUARDAR CAMBIOS FINALES
            // =========================================================

            $transaccion->estado = $nuevoEstado;
            $transaccion->descripcion = $transaccion->descripcion . ($request->comentario_admin ? " | Nota Admin: " . $request->comentario_admin : "");
            $transaccion->save(); // Guardamos los cambios de saldos y estado

            DB::commit();

            return response()->json([
                'message' => "Transacción actualizada a {$nuevoEstado} correctamente.",
                'transaccion' => $transaccion->fresh(),
                'saldo_actual_usuario' => $wallet->saldo
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar la transacción.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Transaccion $transaccion)
    {
        return response()->json($transaccion->load(['wallet.user', 'compra.oferta']), 200);
    }
}
