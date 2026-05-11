<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('metodo_pago_numero_cuenta', function (Blueprint $table) {
            $table->foreignId('metodo_pago_id')->constrained('metodos_pago')->cascadeOnDelete();
            $table->foreignId('numero_cuenta_id')->constrained('numero_cuentas')->cascadeOnDelete();
            $table->primary(['metodo_pago_id', 'numero_cuenta_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metodo_pago_numero_cuenta');
    }
};
