<?php

namespace App\Http\Controllers;

use App\Models\Compra;
use App\Models\Oferta;
use App\Models\Transaccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CompraController extends Controller
{
    /**
     * Listar las compras del usuario autenticado.
     */
    public function index()
    {
        $user = Auth::user();

        // Verificación de seguridad
        if (!$user) {
             return response()->json(['message' => 'No estás autenticado. Token no válido o ausente.'], 401);
        }

        $compras = Compra::with(['oferta.servicios', 'transaccion'])
                         ->where('user_id', $user->id)
                         ->orderBy('created_at', 'desc')
                         ->get();

        return response()->json($compras, 200);
    }

    /**
     * Realizar una nueva compra.
     */
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

        // 1. Verificar si el usuario tiene Wallet
        if (!$user->wallet) {
            return response()->json(['message' => 'El usuario no tiene una billetera activa. Contacta soporte.'], 400);
        }

        DB::beginTransaction();

        try {
            // 2. Obtener la oferta y bloquearla para lectura
            $oferta = Oferta::where('id', $request->oferta_id)->lockForUpdate()->first();

            // 3. Validar Stock
            if ($oferta->stock <= 0) {
                return response()->json(['message' => 'Lo sentimos, esta oferta se ha agotado.'], 409);
            }

            // 4. Validar Saldo
            if ($user->wallet->saldo < $oferta->precio) {
                return response()->json([
                    'message' => 'Saldo insuficiente para realizar esta compra.',
                    'saldo_actual' => $user->wallet->saldo,
                    'precio_oferta' => $oferta->precio
                ], 402);
            }

            // Calculamos los saldos para el registro histórico
            $saldoAnterior = $user->wallet->saldo;
            $saldoNuevo = $saldoAnterior - $oferta->precio;

            // 5. Crear la Transacción (Pendiente)
            $transaccion = Transaccion::create([
                'wallet_id' => $user->wallet->id,
                'tipo' => 'egreso',
                'monto' => $oferta->precio,
                'saldo_anterior' => $saldoAnterior,
                'saldo_nuevo' => $saldoNuevo, // Esto es informativo
                'estado' => 'pendiente',
                'descripcion' => "Compra de oferta #{$oferta->id} - Pendiente de aprobación",
                'referencia' => 'COMPRA-' . time() . '-' . $user->id
            ]);

            // 6. Crear la Compra
            $compra = Compra::create([
                'user_id' => $user->id,
                'oferta_id' => $oferta->id,
                'transaccion_id' => $transaccion->id,
                'precio_compra' => $oferta->precio,
                'estado' => 'pendiente',
                'nota' => $request->nota
            ]);

            // 7. Descontar Stock (Reserva)
            $oferta->decrement('stock');

            // 🚨 8. DESCUENTO REAL DE DINERO (Congelamiento de fondos)
            // Esta línea faltaba y es vital para que coincida con la lógica del Admin
            $user->wallet->decrement('saldo', $oferta->precio);

            DB::commit();

            return response()->json([
                'message' => 'Compra solicitada con éxito. Fondos descontados y esperando aprobación.',
                'compra' => $compra->load('oferta')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al procesar la compra.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar detalle de una compra.
     */
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
}
