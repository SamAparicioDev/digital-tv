<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('descuento_streaming_service', function (Blueprint $table) {
            $table->foreignId('descuento_id')->constrained('descuentos')->cascadeOnDelete();
            $table->foreignId('streaming_service_id')->constrained('streaming_services')->cascadeOnDelete();
            $table->primary(['descuento_id', 'streaming_service_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('descuento_streaming_service');
    }
};
