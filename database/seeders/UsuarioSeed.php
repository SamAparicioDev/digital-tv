<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeed extends Seeder
{
    public function run(): void
    {
        $numUsers = rand(5, 20);

        for ($i = 0; $i < $numUsers; $i++) {

            $user = User::create([
                'name'     => fake()->name(),
                'email'    => fake()->unique()->safeEmail(),
                'password' => Hash::make('password123'),
            ]);

            Wallet::create([
                'user_id' => $user->id,
                'saldo'   => rand(10000, 500000) / 10,
            ]);
        }

        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ])->wallet()->create([
            'saldo' => 100000,
        ]);
    }
}
