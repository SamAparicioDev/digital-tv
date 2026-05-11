<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('descuentos', function (Blueprint $table) {
            $table->decimal('valor_global', 10, 2)->nullable()->after('is_active');
            $table->string('tipo_global', 20)->nullable()->after('valor_global');
        });
    }

    public function down(): void
    {
        Schema::table('descuentos', function (Blueprint $table) {
            $table->dropColumn(['valor_global', 'tipo_global']);
        });
    }
};
