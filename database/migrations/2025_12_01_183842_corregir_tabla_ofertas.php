<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('ofertas', function (Blueprint $table) {
            $table->id();

            $table->integer('garantia_dias')->comment('Días de garantía aplicables a la oferta completa.');
            $table->decimal('precio', 8, 2)->comment('Precio final de la Mega-Oferta.');

            $table->boolean('cuenta_completa')->default(false)->comment('Indica si se entrega la cuenta maestra completa.');
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->engine = 'InnoDB';
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ofertas');
    }
};
