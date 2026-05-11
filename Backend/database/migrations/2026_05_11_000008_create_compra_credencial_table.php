<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('compra_credencial', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compra_id')->unique()->constrained('compras')->cascadeOnDelete();
            $table->foreignId('cuenta_id')->nullable()->constrained('cuentas_streaming')->nullOnDelete();
            $table->foreignId('perfil_id')->nullable()->constrained('perfiles_streaming')->nullOnDelete();
            $table->date('vigencia_desde');
            $table->date('vigencia_hasta');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compra_credencial');
    }
};
