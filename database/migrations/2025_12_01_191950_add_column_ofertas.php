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
        Schema::table('ofertas', function (Blueprint $table) {
            if (!Schema::hasColumn('ofertas', 'stock')) {
                // Agregamos la columna 'stock' para controlar el inventario de la oferta
                $table->integer('stock')
                      ->default(0)
                      ->comment('Cantidad de ofertas disponibles para la venta.')
                      ->after('precio'); // Opcional: para colocarlo después del precio
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ofertas', function (Blueprint $table) {
            if (Schema::hasColumn('ofertas', 'stock')) {
                $table->dropColumn('stock');
            }
        });
    }
};
