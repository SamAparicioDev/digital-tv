<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('compra_credencial', function (Blueprint $table) {
            // Agregar user_id para asignaciones manuales del admin
            $table->foreignId('user_id')
                ->nullable()
                ->after('compra_id')
                ->constrained('users')
                ->nullOnDelete();
        });

        // Hacer compra_id nullable (PostgreSQL)
        DB::statement('ALTER TABLE compra_credencial DROP CONSTRAINT IF EXISTS compra_credencial_compra_id_unique');
        DB::statement('ALTER TABLE compra_credencial ALTER COLUMN compra_id DROP NOT NULL');
        DB::statement('ALTER TABLE compra_credencial DROP CONSTRAINT IF EXISTS compra_credencial_compra_id_foreign');
        DB::statement('ALTER TABLE compra_credencial ADD CONSTRAINT compra_credencial_compra_id_foreign FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE SET NULL');
    }

    public function down(): void
    {
        Schema::table('compra_credencial', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
        DB::statement('ALTER TABLE compra_credencial ALTER COLUMN compra_id SET NOT NULL');
    }
};
