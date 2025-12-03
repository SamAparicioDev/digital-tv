<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('descuentos', function (Blueprint $table) {
            $table->id();

            $table->string('codigo')->unique()->nullable();
            $table->string('nombre');
            $table->text('descripcion')->nullable();

            $table->timestamp('fecha_inicio');
            $table->timestamp('fecha_fin')->nullable();


            $table->boolean('es_recurrente')->default(false);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('descuentos');
    }
};
