<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\Transaccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class WalletController extends Controller
{
    /**
     * Listar todas las billeteras (Solo Admin).
     */
    public function index()
    {
        // Verificar permisos (asumiendo que usas el middleware de privilegios en la ruta)
        // O validamos manualmente aquí si prefieres:
        if (!Auth::user()->hasPrivilege('gestionar_usuarios')) {
             return response()->json(['message' => 'No autorizado.'], 403);
        }

        $wallets = Wallet::with('user')->get();
        return response()->json($wallets, 200);
    }

    /**
     * Crear wallet manualmente (Generalmente se hace en el Registro, pero útil para Admins).
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id|unique:wallets,user_id',
            'saldo'   => 'required|numeric|min:0'
        ]);

        // Crear la wallet
        $wallet = Wallet::create([
            'user_id' => $request->user_id,
            'saldo'   => $request->saldo
        ]);

        // Si nace con saldo, creamos la transacción de ajuste inicial
        if ($request->saldo > 0) {
            Transaccion::create([
                'wallet_id' => $wallet->id,
                'tipo' => 'ingreso', // O 'ajuste'
                'monto' => $request->saldo,
                'saldo_anterior' => 0,
                'saldo_nuevo' => $request->saldo,
                'estado' => 'aprobada', // Nace aprobada porque lo hace un admin
                'descripcion' => 'Saldo inicial por creación manual',
                'referencia' => 'INIT-ADMIN-' . Auth::id()
            ]);
        }

        return response()->json([
            'ok' => true,
            'wallet' => $wallet
        ], 201);
    }

    /**
     * Mostrar una wallet específica.
     */
    public function show($id)
    {
        $user = Auth::user();
        $wallet = Wallet::with('user')->findOrFail($id);

        // Seguridad: Solo el dueño o un admin con permiso pueden verla
        if ($wallet->user_id !== $user->id && !$user->hasPrivilege('gestionar_usuarios')) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($wallet, 200);
    }

    /**
     * Actualizar Saldo (Solo Admin - Genera Auditoría).
     * Reemplaza tu antiguo 'updateSaldo'
     */
    public function update(Request $request, $id)
    {
        // 1. Validar que sea Admin
        if (!Auth::user()->hasPrivilege('gestionar_usuarios')) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        // 2. Validar datos
        $request->validate([
            'monto' => 'required|numeric', // Puede ser negativo para restar
            'motivo' => 'required|string|max:255' // Obligatorio explicar el ajuste
        ]);

        DB::beginTransaction();

        try {
            $wallet = Wallet::lockForUpdate()->findOrFail($id);

            $monto = (float) $request->monto;
            $saldoAnterior = $wallet->saldo;
            $saldoNuevo = $saldoAnterior + $monto;

            // Evitar saldos negativos
            if ($saldoNuevo < 0) {
                return response()->json(['message' => 'Fondos insuficientes para realizar este ajuste (Resta).'], 400);
            }

            // 3. Actualizar Wallet
            $wallet->saldo = $saldoNuevo;
            $wallet->save();

            // 4. Crear Transacción de Auditoría (CRUCIAL)
            // Usamos un tipo especial 'ajuste' o reutilizamos 'ingreso'/'egreso'
            $tipo = $monto >= 0 ? 'ingreso' : 'egreso'; // O 'retiro'

            Transaccion::create([
                'wallet_id' => $wallet->id,
                'tipo' => $tipo,
                'monto' => abs($monto), // Guardamos valor positivo
                'saldo_anterior' => $saldoAnterior,
                'saldo_nuevo' => $saldoNuevo,
                'estado' => 'aprobada', // Los ajustes de admin son inmediatos
                'descripcion' => 'Ajuste Manual Admin: ' . $request->motivo,
                'referencia' => 'ADJ-' . time() . '-' . Auth::id()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Saldo ajustado correctamente.',
                'wallet' => $wallet
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al ajustar saldo', 'error' => $e->getMessage()], 500);
        }
    }
}
