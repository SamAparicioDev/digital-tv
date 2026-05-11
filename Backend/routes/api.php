<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
use App\Http\Controllers\MetodoPagoController;
use App\Http\Controllers\CuentaStreamingController;
use App\Http\Controllers\MisCuentasController;
use App\Http\Controllers\UserAdminController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\AdminAsignacionController;

// ── Rutas públicas (sin autenticación) ───────────────────────────────────────
Route::post('/ingresar', [AuthController::class, 'ingresar']);
Route::post('/registrar', [AuthController::class, 'registrar']);

// Upload de imágenes (requiere auth)
Route::middleware('auth:sanctum')->post('/upload', [UploadController::class, 'imagen']);

// Catálogo público: ofertas, descuentos y servicios visibles en el landing
Route::get('/oferta', [OfertaController::class, 'index']);
Route::get('/oferta/{oferta}', [OfertaController::class, 'show']);
Route::get('/descuento', [DescuentoController::class, 'index']);
Route::get('/streaming-service', [StreamingServiceController::class, 'index']);
Route::get('/streaming-service/{streaming_service}', [StreamingServiceController::class, 'show']);

// ── Rutas autenticadas ───────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user()->load('roles', 'wallet');
    });

    Route::get('/metodos-pago', [MetodoPagoController::class, 'index']);

    Route::get('/recargas', [RecargaController::class, 'index']);
    Route::post('/recargas', [RecargaController::class, 'store']);
    Route::get('/recargas/{id}', [RecargaController::class, 'show']);
    Route::post('/recargas/{id}/comprobante', [RecargaController::class, 'comprobante']);

    Route::get('/mis-cuentas', [MisCuentasController::class, 'index']);

    Route::get('/compra', [CompraController::class, 'index']);
    Route::post('/compra', [CompraController::class, 'store']);
    Route::get('/compra/{compra}', [CompraController::class, 'show']);

    Route::get('/descuento/{descuento}', [DescuentoController::class, 'show']);

    Route::middleware(['privilege:gestionar_acceso'])->group(function () {
        Route::get('/admin/cuentas', [CuentaStreamingController::class, 'index']);
        Route::post('/admin/cuentas', [CuentaStreamingController::class, 'store']);
        Route::put('/admin/cuentas/{cuenta}', [CuentaStreamingController::class, 'update']);
        Route::delete('/admin/cuentas/{cuenta}', [CuentaStreamingController::class, 'destroy']);
        Route::post('/admin/cuentas/{cuenta}/perfiles', [CuentaStreamingController::class, 'storePerfil']);
        Route::delete('/admin/perfiles/{perfil}', [CuentaStreamingController::class, 'destroyPerfil']);

        Route::apiResource('rol', RolController::class);
        Route::put('rol/{rol}/privilegios', [RolController::class, 'syncPrivilegios']);
        Route::put('rol/{rol}/descuentos', [RolController::class, 'syncDescuentos']);

        Route::apiResource('privilegio', PrivilegioController::class);

        Route::apiResource('wallet', WalletController::class);
        Route::put('/admin/users/{user}/toggle', [UserAdminController::class, 'toggle']);

        // Asignación manual de credenciales a usuarios
        Route::get('/admin/asignaciones', [AdminAsignacionController::class, 'index']);
        Route::post('/admin/asignaciones', [AdminAsignacionController::class, 'store']);
        Route::delete('/admin/asignaciones/{credencial}', [AdminAsignacionController::class, 'destroy']);
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
        Route::put('/admin/transaccion/{transaccion}', [AdminTransaccionController::class, 'update']);
        Route::get('/admin/transaccion/{transaccion}', [AdminTransaccionController::class, 'show']);
    });
});
