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
        // Roles are now seeded in the migration file
        // This seeder is kept for backwards compatibility
        $this->command->info('✓ Roles are seeded via migration');
    }
}
