<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estrenos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->enum('formato', ['pelicula', 'serie'])->default('pelicula');
            $table->string('imagen')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Pivot estreno_streaming_service (N:M)
        Schema::create('estreno_streaming_service', function (Blueprint $table) {
            $table->foreignId('estreno_id')->constrained('estrenos')->onDelete('cascade');
            $table->foreignId('streaming_service_id')->constrained('streaming_services')->onDelete('cascade');
            $table->primary(['estreno_id', 'streaming_service_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estreno_streaming_service');
        Schema::dropIfExists('estrenos');
    }
};
