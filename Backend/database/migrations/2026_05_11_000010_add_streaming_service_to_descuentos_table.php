<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('descuentos', function (Blueprint $table) {
            $table->foreignId('streaming_service_id')
                ->nullable()
                ->after('is_active')
                ->constrained('streaming_services')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('descuentos', function (Blueprint $table) {
            $table->dropForeign(['streaming_service_id']);
            $table->dropColumn('streaming_service_id');
        });
    }
};
