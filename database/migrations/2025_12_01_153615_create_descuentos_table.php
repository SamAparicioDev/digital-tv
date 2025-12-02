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
        Schema::create('descuentos', function (Blueprint $table) {
            $table->id();

            // Información básica del descuento
            $table->string('codigo')->unique()->nullable(); // Código promocional (ej: VERANO20)
            $table->string('nombre');
            $table->text('descripcion')->nullable();

            // Rango de fechas de validez
            $table->timestamp('fecha_inicio');
            $table->timestamp('fecha_fin')->nullable(); // Opcional, para descuentos indefinidos

            // Banderas de estado
            $table->boolean('es_recurrente')->default(false); // Si se puede usar más de una vez
            $table->boolean('is_active')->default(true); // Estado general del descuento

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('descuentos');
    }
};
