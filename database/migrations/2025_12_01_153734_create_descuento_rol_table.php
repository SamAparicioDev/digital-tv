<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('descuento_rol', function (Blueprint $table) {

            // Asegurar motor InnoDB
            $table->engine = 'InnoDB';

            // Clave Primaria de la tabla pivote (puede seguir siendo autoincremental si lo deseas)
            $table->id();

            // --- Relación con Descuentos ---
            // Asumiremos que 'descuentos.id' SÍ es un BIGINT UNSIGNED (estándar de Laravel)
            $table->unsignedBigInteger('descuento_id');
            $table->foreign('descuento_id')
                  ->references('id')
                  ->on('descuentos')
                  ->onDelete('cascade');

            // --- Relación con Roles (La Corrección del UUID) ---
            // 🚨 CAMBIO CRUCIAL: Usamos $table->uuid() para igualar el tipo de la tabla 'rol'
            $table->uuid('role_id');
            $table->foreign('role_id')
                  ->references('id')
                  ->on('rol') // Referencia a la tabla 'rol' singular
                  ->onDelete('cascade');

            // --- Campos de Valor del Descuento ---
            $table->decimal('valor_descuento', 5, 2);
            $table->enum('tipo_descuento', ['porcentaje', 'fijo'])->default('porcentaje');

            // --- Control y Trazabilidad ---
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Clave única para evitar duplicados
            $table->unique(['descuento_id', 'role_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('descuento_rol');
    }
};
