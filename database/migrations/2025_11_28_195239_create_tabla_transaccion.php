<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
{
    Schema::create('transacciones', function (Blueprint $table) {
        $table->id();
        $table->foreignId('wallet_id')->constrained('wallet')->cascadeOnDelete();
        $table->enum('tipo', ['deposit', 'withdraw']);
        $table->decimal('monto', 10, 3);
        $table->decimal('saldo_anterior', 10, 3);
        $table->decimal('saldo_nuevo', 10, 3);
        $table->string('descripcion')->nullable();
        $table->enum('estado', ['PENDIENTE', 'APROBADO', 'RECHAZADO'])->default('PENDIENTE');
        $table->timestamps();
    });
}


    public function down(): void
    {
        Schema::dropIfExists('transaccion');
    }
};
