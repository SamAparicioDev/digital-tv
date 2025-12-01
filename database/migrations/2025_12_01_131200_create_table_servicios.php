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
        Schema::create('streaming_services', function (Blueprint $table) {
            $table->id();

            // Nombre del servicio (Ej: Amazon Prime, Netflix)
            $table->string('name')->unique();

            // Slug para rutas amigables (Ej: amazon-prime)
            // Útil para: tusitio.com/servicios/amazon-prime
            $table->string('slug')->unique();

            // URL o ruta donde se almacena la imagen/logo
            // Se puede guardar 'https://bucket.s3.../logo.png' o 'images/logos/logo.png'
            $table->string('logo_url')->nullable();

            // Color representativo (Opcional, útil para UI. Ej: #00A8E1 para Prime)
            $table->string('primary_color', 7)->nullable();

            // Para activar/desactivar el servicio sin borrarlo de la BD
            $table->boolean('is_active')->default(true);

            $table->timestamps(); // created_at, updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('streaming_services');
    }
};
