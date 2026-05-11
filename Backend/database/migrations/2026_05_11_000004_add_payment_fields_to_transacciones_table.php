<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('transacciones', function (Blueprint $table) {
            $table->foreignId('metodo_pago_id')
                ->nullable()
                ->after('wallet_id')
                ->constrained('metodos_pago')
                ->nullOnDelete();
            $table->string('referencia_pago', 255)->nullable()->after('metodo_pago_id');
        });
    }

    public function down(): void
    {
        Schema::table('transacciones', function (Blueprint $table) {
            $table->dropForeign(['metodo_pago_id']);
            $table->dropColumn(['metodo_pago_id', 'referencia_pago']);
        });
    }
};
