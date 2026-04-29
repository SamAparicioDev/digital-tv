<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('streaming_services', function (Blueprint $table) {
            if (!Schema::hasColumn('streaming_services', 'cantidad_cuentas')) {
                $table->integer('cantidad_cuentas')
                      ->default(0)
                      ->comment('Inventario total de cuentas físicas disponibles.')
                      ->after('primary_color');
            }
        });
    }

    public function down(): void
    {
        Schema::table('streaming_services', function (Blueprint $table) {
            if (Schema::hasColumn('streaming_services', 'cantidad_cuentas')) {
                $table->dropColumn('cantidad_cuentas');
            }
        });
    }
};
