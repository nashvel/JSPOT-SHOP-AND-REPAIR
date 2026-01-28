<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        Branch::create([
            'name' => 'Main Branch (Makati)',
            'address' => 'Ayala Ave, Makati, Metro Manila',
            'contact_number' => '0917-123-4567',
            'latitude' => 14.5547,
            'longitude' => 121.0244,
            'is_main' => true,
        ]);

        Branch::create([
            'name' => 'Downtown Branch (Manila)',
            'address' => 'Rizal Park, Manila',
            'contact_number' => '0918-987-6543',
            'latitude' => 14.5826,
            'longitude' => 120.9787,
            'is_main' => false,
        ]);
        
        Branch::create([
            'name' => 'Uptown Branch (QC)',
            'address' => 'Quezon Memorial Circle, QC',
            'contact_number' => '0919-555-5555',
            'latitude' => 14.6516,
            'longitude' => 121.0493,
            'is_main' => false,
        ]);
    }
}
