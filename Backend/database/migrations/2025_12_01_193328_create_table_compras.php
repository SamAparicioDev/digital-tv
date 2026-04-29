<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compras', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            $table->foreignId('oferta_id')->constrained('ofertas')->onDelete('restrict');

            $table->foreignId('transaccion_id')->constrained('transacciones')->onDelete('restrict');

            $table->decimal('precio_compra', 10, 2);

            $table->enum('estado', ['pendiente', 'aprobada', 'rechazada'])->default('pendiente');

            $table->text('datos_acceso')->nullable()->comment('Credenciales de la cuenta entregada (JSON o Texto)');

            $table->text('nota')->nullable();

            $table->timestamps();
            $table->engine = 'InnoDB';
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compras');
    }
};
