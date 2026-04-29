<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Rol;
use App\Models\Wallet;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminEmail = 'admin@plataforma.com';

        if (!User::where('email', $adminEmail)->exists()) {

            $admin = User::create([
                'name' => 'Super Admin',
                'email' => $adminEmail,
                'password' => 'password123',
            ]);

            Wallet::create([
                'user_id' => $admin->id,
                'saldo' => 0
            ]);

            $rolAdmin = Rol::where('nombre', 'admin')->first();
            if ($rolAdmin) {
                $admin->roles()->attach($rolAdmin->id);
            }
        }
    }
}
