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
use App\Http\Controllers\RecargaController;
use App\Http\Controllers\AdminTransaccionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\WalletController;


Route::post('/ingresar', [AuthController::class, 'ingresar']);
Route::post('/registrar', [AuthController::class, 'registrar']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user()->load('roles', 'wallet');
    });

    Route::get('/recargas', [RecargaController::class, 'index']);
    Route::post('/recargas', [RecargaController::class, 'store']);
    Route::get('/recargas/{id}', [RecargaController::class, 'show']);

    Route::get('/compra', [CompraController::class, 'index']);
    Route::post('/compra', [CompraController::class, 'store']);
    Route::get('/compra/{compra}', [CompraController::class, 'show']);

    Route::get('/oferta', [OfertaController::class, 'index']);
    Route::get('/oferta/{oferta}', [OfertaController::class, 'show']);

    Route::get('/descuento', [DescuentoController::class, 'index']);
    Route::get('/descuento/{descuento}', [DescuentoController::class, 'show']);

    Route::get('/streaming-service', [StreamingServiceController::class, 'index']);
    Route::get('/streaming-service/{streaming_service}', [StreamingServiceController::class, 'show']);


    Route::middleware(['privilege:gestionar_acceso'])->group(function () {
        Route::apiResource('rol', RolController::class);
        Route::put('rol/{rol}/privilegios', [RolController::class, 'syncPrivilegios']);
        Route::put('rol/{rol}/descuentos', [RolController::class, 'syncDescuentos']);

        Route::apiResource('privilegio', PrivilegioController::class);

        Route::apiResource('wallet', WalletController::class);
    });

    Route::middleware(['privilege:gestionar_servicios'])->group(function () {
        Route::post('/streaming-service', [StreamingServiceController::class, 'store']);
        Route::put('/streaming-service/{streaming_service}', [StreamingServiceController::class, 'update']);
        Route::delete('/streaming-service/{streaming_service}', [StreamingServiceController::class, 'destroy']);
    });

    Route::middleware(['privilege:gestionar_ofertas'])->group(function () {

        Route::post('/oferta', [OfertaController::class, 'store']);
        Route::put('/oferta/{oferta}', [OfertaController::class, 'update']);
        Route::delete('/oferta/{oferta}', [OfertaController::class, 'destroy']);

        Route::post('/descuento', [DescuentoController::class, 'store']);
        Route::put('/descuento/{descuento}', [DescuentoController::class, 'update']);
        Route::delete('/descuento/{descuento}', [DescuentoController::class, 'destroy']);
    });

    Route::middleware(['privilege:gestionar_transacciones'])->group(function () {
        Route::get('/admin/transaccion', [AdminTransaccionController::class, 'index']);
        Route::put('/admin/transaccion/{transaccion}', [AdminTransaccionController::class, 'update']); // Aprobar/Rechazar
        Route::get('/admin/transaccion/{transaccion}', [AdminTransaccionController::class, 'show']);
    });

});
