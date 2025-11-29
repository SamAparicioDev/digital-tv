<?php

use App\Http\Controllers\PrivilegioController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransaccionController;
use App\Http\Controllers\WalletController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(middleware: 'auth:sanctum');

Route::post('/registrar', [AuthController::class, 'registrar']);
Route::post('/ingresar', [AuthController::class, 'ingresar']);
Route::apiResource('rol', RolController::class);
Route::apiResource('privilegio', PrivilegioController::class);
Route::apiResource('wallet', WalletController::class);
Route::apiResource('transaccion', TransaccionController::class);
