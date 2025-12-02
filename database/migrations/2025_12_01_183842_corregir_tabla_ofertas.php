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
        Schema::create('ofertas', function (Blueprint $table) {
            $table->id();

            // --- CAMPOS GLOBALES DE LA OFERTA ---
            // Ya NO incluimos streaming_service_id, numero_perfiles ni duracion_dias
            // porque esos datos ahora van en la tabla pivote 'oferta_servicio'.

            $table->integer('garantia_dias')->comment('Días de garantía aplicables a la oferta completa.');
            $table->decimal('precio', 8, 2)->comment('Precio final de la Mega-Oferta.');

            // Indicadores Booleanos
            $table->boolean('cuenta_completa')->default(false)->comment('Indica si se entrega la cuenta maestra completa.');
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Aseguramos motor InnoDB
            $table->engine = 'InnoDB';
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ofertas');
    }
};
