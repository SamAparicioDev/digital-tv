<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Quitar AUTO_INCREMENT del id viejo
        DB::statement('ALTER TABLE rol MODIFY id INT');

        // 2. Quitar la primary key
        DB::statement('ALTER TABLE rol DROP PRIMARY KEY');

        // 3. Eliminar la columna id
        Schema::table('rol', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        // 4. Crear nueva columna uuid como primary
        Schema::table('rol', function (Blueprint $table) {
            $table->uuid('id')->primary();
        });
    }

    public function down(): void
    {
        //
    }
};
