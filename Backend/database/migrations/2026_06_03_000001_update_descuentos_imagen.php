<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('descuentos', function (Blueprint $table) {
            // Eliminar campos que ya no se usan
            if (Schema::hasColumn('descuentos', 'codigo')) {
                $table->dropColumn('codigo');
            }
            if (Schema::hasColumn('descuentos', 'descripcion')) {
                $table->dropColumn('descripcion');
            }
            // Agregar campo de imagen
            if (!Schema::hasColumn('descuentos', 'imagen_url')) {
                $table->string('imagen_url')->nullable()->after('nombre');
            }
        });
    }

    public function down(): void
    {
        Schema::table('descuentos', function (Blueprint $table) {
            $table->dropColumn('imagen_url');
            $table->string('codigo')->nullable();
            $table->text('descripcion')->nullable();
        });
    }
};
