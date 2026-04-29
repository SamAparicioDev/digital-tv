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

    public function update(Request $request, Transaccion $transaccion)
    {
        $request->validate([
            'estado' => ['required', Rule::in(['aprobada', 'rechazada', 'pendiente', 'APROBADO', 'RECHAZADO', 'PENDIENTE'])],
            'comentario_admin' => 'nullable|string|max:255'
        ]);

        $nuevoEstado = strtolower($request->estado);
        $estadoActual = strtolower($transaccion->estado);

        if ($estadoActual !== 'pendiente' && $nuevoEstado !== $estadoActual) {
            return response()->json([
                'message' => 'Esta transacción ya fue procesada anteriormente.'
            ], 409);
        }

        DB::beginTransaction();

        try {

            $wallet = $transaccion->wallet()->lockForUpdate()->first();

            $saldoAlMomentoDeOperar = $wallet->saldo;

            $tipoTransaccion = strtolower($transaccion->tipo); // 'ingreso', 'egreso' o 'retiro'
            $compra = Compra::where('transaccion_id', $transaccion->id)->first();

            if ($tipoTransaccion === 'ingreso') {
                if ($nuevoEstado === 'aprobada') {
                    $wallet->saldo += $transaccion->monto;
                    $wallet->save();
                    $transaccion->saldo_anterior = $saldoAlMomentoDeOperar;
                    $transaccion->saldo_nuevo    = $wallet->saldo; // El nuevo saldo sumado
                }
            }
            else {

                if ($nuevoEstado === 'aprobada') {
                    if ($compra) $compra->update(['estado' => 'aprobada']);


                }
                elseif ($nuevoEstado === 'rechazada') {
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


            $transaccion->estado = $nuevoEstado;
            $transaccion->descripcion = $transaccion->descripcion . ($request->comentario_admin ? " | Nota Admin: " . $request->comentario_admin : "");
            $transaccion->save(); 

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
