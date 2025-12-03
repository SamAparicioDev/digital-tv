<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario_rol', function (Blueprint $table) {
            // ❌ NO USAR: $table->id('usuario_id'); (Esto crea un ID autoincremental que choca)

            // ✅ CORRECTO: Definir las columnas de las llaves foráneas
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('rol_id')->constrained('rol')->onDelete('cascade');

            // Clave primaria compuesta (La combinación de ambos es única)
            $table->primary(['usuario_id', 'rol_id']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario_rol');
    }
};
