<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MetodoPago;
use App\Models\NumeroCuenta;

class MetodoPagoSeeder extends Seeder
{
    public function run(): void
    {
        // Números de cuenta (idempotente)
        $numCompartido = NumeroCuenta::firstOrCreate(
            ['numero' => '3168699959'],
            ['descripcion' => null, 'is_active' => true]
        );

        $numBancolombia = NumeroCuenta::firstOrCreate(
            ['numero' => '82400003955'],
            ['descripcion' => 'Cuenta de ahorros', 'is_active' => true]
        );

        // Métodos de pago
        $nequi = MetodoPago::firstOrCreate(
            ['nombre' => 'Nequi'],
            ['tipo' => 'banco', 'emoji' => '💜', 'color' => '#7E3AF2', 'is_active' => true]
        );

        $bancolombia = MetodoPago::firstOrCreate(
            ['nombre' => 'Bancolombia'],
            ['tipo' => 'banco', 'emoji' => '💛', 'color' => '#FBBF24', 'is_active' => true]
        );

        $daviplata = MetodoPago::firstOrCreate(
            ['nombre' => 'Daviplata'],
            ['tipo' => 'banco', 'emoji' => '🔴', 'color' => '#EF4444', 'is_active' => true]
        );

        MetodoPago::firstOrCreate(
            ['nombre' => 'Moneda Sistema'],
            ['tipo' => 'sistema', 'emoji' => null, 'color' => null, 'is_active' => true]
        );

        // Relaciones N:M (sync para evitar duplicados)
        $nequi->numeroCuentas()->syncWithoutDetaching([$numCompartido->id]);
        $bancolombia->numeroCuentas()->syncWithoutDetaching([$numBancolombia->id]);
        $daviplata->numeroCuentas()->syncWithoutDetaching([$numCompartido->id]);
    }
}
