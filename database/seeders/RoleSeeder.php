<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin
        \App\Models\User::factory()->create([
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Branch Manager (was Director)
        \App\Models\User::factory()->create([
            'name' => 'Branch Manager',
            'email' => 'manager@example.com',
            'password' => bcrypt('password'),
            'role' => 'manager',
        ]);

        // Cashier (was Overall In-Charge)
        \App\Models\User::factory()->create([
            'name' => 'Cashier Staff',
            'email' => 'cashier@example.com',
            'password' => bcrypt('password'),
            'role' => 'cashier',
        ]);

        // Mechanic (was Area In-Charge)
        \App\Models\User::factory()->create([
            'name' => 'Head Mechanic',
            'email' => 'mechanic@example.com',
            'password' => bcrypt('password'),
            'role' => 'mechanic',
        ]);
    }
}
