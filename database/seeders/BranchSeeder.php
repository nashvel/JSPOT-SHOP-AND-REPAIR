<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        // Get the manager role
        $managerRole = \App\Models\Role::where('name', 'manager')->first();
        
        // 1. Create Main Branch
        $mainBranch = Branch::create([
            'name' => 'Main Branch (Makati)',
            'email' => 'makati@jspot.com',
            'password' => bcrypt('password'),
            'address' => 'Ayala Ave, Makati, Metro Manila',
            'contact_number' => '0917-123-4567',
            'latitude' => 14.5547,
            'longitude' => 121.0244,
            'is_main' => true,
        ]);

        // Create user for Main Branch
        User::create([
            'name' => 'Main Branch Manager',
            'email' => 'main.branch@jspot.com', // Log in with THIS email
            'password' => Hash::make('password'),
            'role_id' => $managerRole->id,
            'branch_id' => $mainBranch->id,
        ]);

        // 2. Create Downtown Branch
        $downtownBranch = Branch::create([
            'name' => 'Downtown Branch (Manila)',
            'email' => 'manila@jspot.com',
            'password' => bcrypt('password'),
            'address' => 'Rizal Park, Manila',
            'contact_number' => '0918-987-6543',
            'latitude' => 14.5826,
            'longitude' => 120.9787,
            'is_main' => false,
        ]);

        // Create user for Downtown Branch
        User::create([
            'name' => 'Downtown Branch Manager',
            'email' => 'downtown.branch@jspot.com',
            'password' => Hash::make('password'),
            'role_id' => $managerRole->id,
            'branch_id' => $downtownBranch->id,
        ]);
        
        // 3. Create Uptown Branch
        $uptownBranch = Branch::create([
            'name' => 'Uptown Branch (QC)',
            'email' => 'qc@jspot.com',
            'password' => bcrypt('password'),
            'address' => 'Quezon Memorial Circle, QC',
            'contact_number' => '0919-555-5555',
            'latitude' => 14.6516,
            'longitude' => 121.0493,
            'is_main' => false,
        ]);

        // Create user for Uptown Branch
        User::create([
            'name' => 'Uptown Branch Manager',
            'email' => 'uptown.branch@jspot.com',
            'password' => Hash::make('password'),
            'role_id' => $managerRole->id,
            'branch_id' => $uptownBranch->id,
        ]);
    }
}
