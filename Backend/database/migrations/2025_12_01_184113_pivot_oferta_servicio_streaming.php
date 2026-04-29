<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('oferta_servicio', function (Blueprint $table) {
            $table->id();

            $table->foreignId('oferta_id')->constrained('ofertas')->onDelete('cascade');
            $table->foreignId('streaming_service_id')->constrained('streaming_services')->onDelete('cascade');

            $table->integer('numero_perfiles')->comment('Perfiles ofrecidos para ESTE servicio en la oferta.');
            $table->integer('duracion_dias')->comment('Duración en días para ESTE servicio en la oferta.');

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['oferta_id', 'streaming_service_id']);

            $table->engine = 'InnoDB';
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oferta_servicio');
    }
};
