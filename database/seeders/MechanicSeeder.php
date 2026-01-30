<?php

namespace Database\Seeders;

use App\Models\Mechanic;
use App\Models\Branch;
use Illuminate\Database\Seeder;

class MechanicSeeder extends Seeder
{
    public function run(): void
    {
        $branches = Branch::all();

        if ($branches->isEmpty()) {
            $this->command->warn('No branches found. Please seed branches first.');
            return;
        }

        $mechanics = [
            ['name' => 'Juan Dela Cruz', 'specialization' => 'Engine Specialist'],
            ['name' => 'Pedro Santos', 'specialization' => 'Electrical Systems'],
            ['name' => 'Mario Reyes', 'specialization' => 'Brake & Suspension'],
            ['name' => 'Jose Garcia', 'specialization' => 'General Mechanic'],
            ['name' => 'Carlos Mendoza', 'specialization' => 'Transmission Expert'],
        ];

        foreach ($branches as $branch) {
            foreach ($mechanics as $mechanic) {
                Mechanic::create([
                    'name' => $mechanic['name'],
                    'specialization' => $mechanic['specialization'],
                    'branch_id' => $branch->id,
                    'is_active' => true,
                ]);
            }
        }

        $this->command->info('Created ' . (count($mechanics) * $branches->count()) . ' mechanics across all branches.');
    }
}
