<?php

namespace App\Http\Controllers;

use App\Models\Transaccion;
use App\Models\Compra;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminTransaccionController extends Controller
{
    /**
     * Listar todas las transacciones (filtro opcional por estado).
     */
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

        // Evitar procesar transacciones ya finalizadas
        if ($estadoActual !== 'pendiente' && $nuevoEstado !== $estadoActual) {
            return response()->json([
                'message' => 'Esta transacción ya fue procesada anteriormente.'
            ], 409);
        }

        DB::beginTransaction();

        try {
            $tipoTransaccion = strtolower($transaccion->tipo); // 'ingreso', 'egreso' o 'retiro'

            // ==========================================
            // CASO 1: INGRESOS (Recargas de saldo)
            // ==========================================
            if ($tipoTransaccion === 'ingreso') {
                if ($nuevoEstado === 'aprobada') {
                    // El dinero entra a la billetera solo al aprobarse
                    $transaccion->wallet->increment('saldo', $transaccion->monto);
                }
                // Si se rechaza un ingreso, no se hace nada con el saldo porque nunca entró.
            }

            // ==========================================
            // CASO 2: EGRESOS (Compras o Retiros)
            // ==========================================
            else {
                // Asumimos que para compras/egresos el saldo YA SE DESCONTÓ al crear la petición (saldo congelado).

                $compra = Compra::where('transaccion_id', $transaccion->id)->first();

                if ($nuevoEstado === 'aprobada') {
                    // El dinero ya se descontó antes, solo confirmamos el estado de la compra.
                    if ($compra) {
                        $compra->update(['estado' => 'aprobada']);
                    }
                }
                elseif ($nuevoEstado === 'rechazada') {
                    // REEMBOLSO: Como rechazamos, debemos devolver el dinero que se "congeló".
                    $transaccion->wallet->increment('saldo', $transaccion->monto);

                    // Devolver el Stock si era una compra
                    if ($compra) {
                        $compra->update(['estado' => 'rechazada']);
                        $compra->oferta->increment('stock');
                    }
                }
            }

            // ==========================================
            // ACTUALIZAR REGISTRO DE TRANSACCIÓN
            // ==========================================

            // Actualizamos el saldo nuevo histórico para reflejar la realidad post-aprobación/rechazo
            // (Opcional, pero útil para auditoría si el saldo cambió en este paso)
            $saldoFinal = $transaccion->wallet->fresh()->saldo;

            $transaccion->update([
                'estado' => $nuevoEstado,
                'saldo_nuevo' => $saldoFinal, // Actualizamos el snapshot del saldo
                'descripcion' => $transaccion->descripcion . ($request->comentario_admin ? " | Nota Admin: " . $request->comentario_admin : "")
            ]);

            DB::commit();

            return response()->json([
                'message' => "Transacción actualizada a {$nuevoEstado} correctamente.",
                'transaccion' => $transaccion->fresh(['wallet', 'compra']),
                'saldo_actual_usuario' => $saldoFinal
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
