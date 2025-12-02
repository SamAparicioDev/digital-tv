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
        // Usamos Schema::table para MODIFICAR una tabla existente
        Schema::table('streaming_services', function (Blueprint $table) {
            if (!Schema::hasColumn('streaming_services', 'cantidad_cuentas')) {
                $table->integer('cantidad_cuentas')
                      ->default(0)
                      ->comment('Inventario total de cuentas físicas disponibles.')
                      ->after('primary_color'); // Opcional: para ordenarlo visualmente
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('streaming_services', function (Blueprint $table) {
            if (Schema::hasColumn('streaming_services', 'cantidad_cuentas')) {
                $table->dropColumn('cantidad_cuentas');
            }
        });
    }
};
