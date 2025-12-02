<?php

use App\Http\Controllers\PrivilegioController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StreamingServiceController;
use App\Http\Controllers\DescuentoController;
use App\Http\Controllers\AdminTransaccionController;
use App\Http\Controllers\RecargaController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\OfertaController;
use Illuminate\Http\Request;
use App\Http\Controllers\CompraController;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(middleware: 'auth:sanctum');

Route::post('/registrar', [AuthController::class, 'registrar']);
Route::post('/ingresar', [AuthController::class, 'ingresar']);
Route::apiResource('rol', RolController::class);
Route::apiResource('privilegio', PrivilegioController::class);
Route::apiResource('wallet', WalletController::class);
Route::apiResource('recarga', RecargaController::class)->middleware(middleware: 'auth:sanctum');
Route::apiResource('streaming-service', StreamingServiceController::class);
Route::apiResource('descuento', DescuentoController::class);
Route::apiResource('oferta', OfertaController::class);
Route::apiResource('admin/transaccion', AdminTransaccionController::class);
Route::apiResource('compra', CompraController::class)->middleware(middleware: 'auth:sanctum');
