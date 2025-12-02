<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rol;
use App\Models\Privilegio;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        $rolAdmin = Rol::firstOrCreate(
            ['nombre' => 'admin'],
            ['descripcion' => 'Administrador del sistema con acceso total.']
        );

        $todosLosPrivilegios = Privilegio::all();
        $rolAdmin->privilegios()->sync($todosLosPrivilegios);

        Rol::firstOrCreate(
            ['nombre' => 'Cliente'],
            ['descripcion' => 'Usuario final que puede comprar y recargar.']
        );


        $rolVentas = Rol::firstOrCreate(['nombre' => 'Ventas'], ['descripcion' => 'Encargado de ofertas']);
        $permisosVentas = Privilegio::whereIn('nombre', ['gestionar_ofertas', 'gestionar_transacciones'])->get();
        $rolVentas->privilegios()->sync($permisosVentas);

    }
}
