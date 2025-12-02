<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Privilegio;

class PrivilegioSeeder extends Seeder
{
    public function run(): void
    {
        $privilegios = [
            [
                'nombre' => 'gestionar_acceso',
                'acceso' => 'TOTAL',
                'descripcion' => 'Permite crear/editar roles, asignar permisos y ajustar billeteras.'
            ],
            [
                'nombre' => 'gestionar_servicios',
                'acceso' => 'TOTAL',
                'descripcion' => 'Permite crear y editar servicios de streaming (Netflix, Disney, etc).'
            ],
            [
                'nombre' => 'gestionar_ofertas',
                'acceso' => 'TOTAL',
                'descripcion' => 'Permite crear ofertas, mega ofertas y descuentos.'
            ],
            [
                'nombre' => 'gestionar_transacciones',
                'acceso' => 'TOTAL',
                'descripcion' => 'Permite aprobar o rechazar recargas y compras.'
            ],
        ];

        foreach ($privilegios as $priv) {
            Privilegio::firstOrCreate(
                ['nombre' => $priv['nombre']],
                $priv
            );
        }
    }
}
