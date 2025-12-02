<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Importación de Controladores
use App\Http\Controllers\RolController;
use App\Http\Controllers\PrivilegioController;
use App\Http\Controllers\StreamingServiceController;
use App\Http\Controllers\OfertaController;
use App\Http\Controllers\DescuentoController;
use App\Http\Controllers\CompraController;
use App\Http\Controllers\RecargaController; // Anteriormente TransaccionController
use App\Http\Controllers\AdminTransaccionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\WalletController; // Si decidiste usarlo para ajustes administrativos

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS (Sin Token)
|--------------------------------------------------------------------------
*/
Route::post('/ingresar', [AuthController::class, 'ingresar']);
Route::post('/registrar', [AuthController::class, 'registrar']);

/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS (Requieren Token 'Bearer')
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // ==========================================
    // 1. RUTAS COMUNES (Para cualquier usuario logueado)
    // ==========================================

    // Cerrar sesión
    Route::post('/logout', [AuthController::class, 'logout']);

    // Información del perfil
    Route::get('/user', function (Request $request) {
        return $request->user()->load('roles', 'wallet');
    });

    // Módulo de Recargas (Usuario solicita saldo)
    Route::get('/recargas', [RecargaController::class, 'index']);
    Route::post('/recargas', [RecargaController::class, 'store']);
    Route::get('/recargas/{id}', [RecargaController::class, 'show']); // Agregado método show

    // Módulo de Compras (Usuario compra ofertas)
    Route::get('/compra', [CompraController::class, 'index']);
    Route::post('/compra', [CompraController::class, 'store']);
    Route::get('/compra/{compra}', [CompraController::class, 'show']);

    // Ver Ofertas (Lectura pública para usuarios)
    Route::get('/oferta', [OfertaController::class, 'index']);
    Route::get('/oferta/{oferta}', [OfertaController::class, 'show']);

    // Ver Descuentos (Lectura pública para saber qué promociones hay)
    Route::get('/descuento', [DescuentoController::class, 'index']);
    Route::get('/descuento/{descuento}', [DescuentoController::class, 'show']);

    // Ver Servicios de Streaming (Lectura pública)
    Route::get('/streaming-service', [StreamingServiceController::class, 'index']);
    Route::get('/streaming-service/{streaming_service}', [StreamingServiceController::class, 'show']);


    // ==========================================
    // 2. RUTAS ADMINISTRATIVAS (Protegidas por Privilegios)
    // ==========================================

    // GRUPO A: Gestión de Acceso (Roles y Permisos)
    // Privilegio requerido en DB: 'gestionar_acceso'
    Route::middleware(['privilege:gestionar_acceso'])->group(function () {
        Route::apiResource('rol', RolController::class);
        Route::put('rol/{rol}/privilegios', [RolController::class, 'syncPrivilegios']);
        Route::put('rol/{rol}/descuentos', [RolController::class, 'syncDescuentos']);

        Route::apiResource('privilegio', PrivilegioController::class);

        // Gestión de Wallets (Ajustes de saldo por admin)
        Route::apiResource('wallet', WalletController::class);
    });

    // GRUPO B: Gestión de Servicios (Netflix, Disney, etc.)
    // Privilegio requerido en DB: 'gestionar_servicios'
    Route::middleware(['privilege:gestionar_servicios'])->group(function () {
        // Solo rutas de escritura (CUD)
        Route::post('/streaming-service', [StreamingServiceController::class, 'store']);
        Route::put('/streaming-service/{streaming_service}', [StreamingServiceController::class, 'update']);
        Route::delete('/streaming-service/{streaming_service}', [StreamingServiceController::class, 'destroy']);
    });

    // GRUPO C: Gestión de Ofertas y Descuentos
    // Privilegio requerido en DB: 'gestionar_ofertas'
    Route::middleware(['privilege:gestionar_ofertas'])->group(function () {

        // Ofertas (CUD)
        Route::post('/oferta', [OfertaController::class, 'store']);
        Route::put('/oferta/{oferta}', [OfertaController::class, 'update']);
        Route::delete('/oferta/{oferta}', [OfertaController::class, 'destroy']);

        // Descuentos (CUD)
        Route::post('/descuento', [DescuentoController::class, 'store']);
        Route::put('/descuento/{descuento}', [DescuentoController::class, 'update']);
        Route::delete('/descuento/{descuento}', [DescuentoController::class, 'destroy']);
    });

    // GRUPO D: Finanzas (Aprobar pagos y transacciones)
    // Privilegio requerido en DB: 'gestionar_transacciones'
    Route::middleware(['privilege:gestionar_transacciones'])->group(function () {
        Route::get('/admin/transaccion', [AdminTransaccionController::class, 'index']);
        Route::put('/admin/transaccion/{transaccion}', [AdminTransaccionController::class, 'update']); // Aprobar/Rechazar
        Route::get('/admin/transaccion/{transaccion}', [AdminTransaccionController::class, 'show']);
    });

});
