<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE rol MODIFY id INT');

        DB::statement('ALTER TABLE rol DROP PRIMARY KEY');

        Schema::table('rol', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        Schema::table('rol', function (Blueprint $table) {
            $table->uuid('id')->primary();
        });
    }

    public function down(): void
    {
        //
    }
};
