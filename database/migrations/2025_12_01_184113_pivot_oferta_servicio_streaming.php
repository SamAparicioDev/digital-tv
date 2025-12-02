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
        // Solo creamos la tabla pivote. No tocamos la tabla 'ofertas'.
        Schema::create('oferta_servicio', function (Blueprint $table) {
            $table->id();

            // Claves Foráneas
            // onDelete('cascade') asegura que si borras la oferta, se borran sus relaciones
            $table->foreignId('oferta_id')->constrained('ofertas')->onDelete('cascade');
            $table->foreignId('streaming_service_id')->constrained('streaming_services')->onDelete('cascade');

            // Campos de configuración específicos del servicio dentro de la oferta
            $table->integer('numero_perfiles')->comment('Perfiles ofrecidos para ESTE servicio en la oferta.');
            $table->integer('duracion_dias')->comment('Duración en días para ESTE servicio en la oferta.');

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Evitar duplicados: Una oferta no puede tener el mismo servicio dos veces
            $table->unique(['oferta_id', 'streaming_service_id']);

            $table->engine = 'InnoDB';
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('oferta_servicio');
    }
};
