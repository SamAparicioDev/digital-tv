<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario_rol', function (Blueprint $table) {
            $table->id('usuario_id');
            $table->uuid('rol_id');

            // No se necesita id propio en pivot
            $table->primary(['usuario_id', 'rol_id']);

            // FKs
            $table->foreign('usuario_id')
                ->references('id')->on('users')
                ->onDelete('cascade');

            $table->foreign('rol_id')
                ->references('id')->on('rol')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario_rol');
    }
};
