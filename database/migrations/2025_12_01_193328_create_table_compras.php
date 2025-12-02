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

            // Relación con el Usuario (Comprador)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Relación con la Oferta comprada
            $table->foreignId('oferta_id')->constrained('ofertas')->onDelete('restrict');

            // Relación con la Transacción (El movimiento de dinero asociado)
            // Asumimos que existe la tabla 'transacciones'
            $table->foreignId('transaccion_id')->constrained('transacciones')->onDelete('restrict');

            // Snapshot del precio (Importante: el precio de la oferta puede cambiar a futuro,
            // pero el precio de la compra debe quedar fijo)
            $table->decimal('precio_compra', 10, 2);

            // Estado de la compra
            $table->enum('estado', ['pendiente', 'aprobada', 'rechazada'])->default('pendiente');

            // Datos de acceso (Aquí el admin pondrá el correo/pass cuando apruebe)
            $table->text('datos_acceso')->nullable()->comment('Credenciales de la cuenta entregada (JSON o Texto)');

            // Notas adicionales del usuario o admin
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
