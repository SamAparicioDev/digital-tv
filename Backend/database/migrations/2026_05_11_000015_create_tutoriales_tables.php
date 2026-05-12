<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Categorías de tutoriales
        Schema::create('tutorial_categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            $table->string('descripcion')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tutoriales (videos de YouTube)
        Schema::create('tutoriales', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('descripcion')->nullable();
            $table->string('youtube_url'); // URL completa del video
            $table->string('youtube_id')->nullable(); // ID extraído (para thumbnail)
            $table->string('duracion')->nullable(); // ej. "5:30"
            $table->foreignId('categoria_id')->nullable()->constrained('tutorial_categorias')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutoriales');
        Schema::dropIfExists('tutorial_categorias');
    }
};
