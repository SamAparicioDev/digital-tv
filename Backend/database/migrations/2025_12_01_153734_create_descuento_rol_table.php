<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('descuento_rol', function (Blueprint $table) {


            $table->engine = 'InnoDB';

            $table->id();

            $table->unsignedBigInteger('descuento_id');
            $table->foreign('descuento_id')
                  ->references('id')
                  ->on('descuentos')
                  ->onDelete('cascade');

            $table->uuid('role_id');
            $table->foreign('role_id')
                  ->references('id')
                  ->on('rol')
                  ->onDelete('cascade');

            $table->decimal('valor_descuento', 5, 2);
            $table->enum('tipo_descuento', ['porcentaje', 'fijo'])->default('porcentaje');

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['descuento_id', 'role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('descuento_rol');
    }
};
