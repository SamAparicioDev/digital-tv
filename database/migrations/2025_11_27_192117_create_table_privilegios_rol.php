<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('privilegio_rol', function (Blueprint $table) {
            $table->uuid('privilegio_id');
            $table->uuid('rol_id');

            // Primary key compuesta
            $table->primary(['privilegio_id', 'rol_id']);

            // Foreign keys
            $table->foreign('privilegio_id')
                ->references('id')->on('privilegios')
                ->onDelete('cascade');

            $table->foreign('rol_id')
                ->references('id')->on('rol')
                ->onDelete('cascade');


             $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('privilegio_rol');
    }
};
