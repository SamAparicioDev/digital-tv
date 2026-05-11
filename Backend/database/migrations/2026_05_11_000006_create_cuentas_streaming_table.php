<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cuentas_streaming', function (Blueprint $table) {
            $table->id();
            $table->foreignId('streaming_service_id')->constrained('streaming_services')->cascadeOnDelete();
            $table->string('email');
            $table->string('password');
            $table->text('descripcion')->nullable();
            $table->date('vigencia_hasta')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cuentas_streaming');
    }
};
