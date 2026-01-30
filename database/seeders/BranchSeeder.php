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
        // Create user for Main Branch
        $mainUser = User::create([
            'name' => 'Main Branch Manager',
            'email' => 'main.branch@jspot.com',
            'password' => Hash::make('password'),
            'role' => 'branch_manager',
        ]);

        Branch::create([
            'name' => 'Main Branch (Makati)',
            'email' => 'makati@jspot.com',
            'password' => bcrypt('password'),
            'address' => 'Ayala Ave, Makati, Metro Manila',
            'contact_number' => '0917-123-4567',
            'latitude' => 14.5547,
            'longitude' => 121.0244,
            'is_main' => true,
            'user_id' => $mainUser->id,
        ]);

        // Create user for Downtown Branch
        $downtownUser = User::create([
            'name' => 'Downtown Branch Manager',
            'email' => 'downtown.branch@jspot.com',
            'password' => Hash::make('password'),
            'role' => 'branch_manager',
        ]);

        Branch::create([
            'name' => 'Downtown Branch (Manila)',
            'email' => 'manila@jspot.com',
            'password' => bcrypt('password'),
            'address' => 'Rizal Park, Manila',
            'contact_number' => '0918-987-6543',
            'latitude' => 14.5826,
            'longitude' => 120.9787,
            'is_main' => false,
            'user_id' => $downtownUser->id,
        ]);
        
        // Create user for Uptown Branch
        $uptownUser = User::create([
            'name' => 'Uptown Branch Manager',
            'email' => 'uptown.branch@jspot.com',
            'password' => Hash::make('password'),
            'role' => 'branch_manager',
        ]);

        Branch::create([
            'name' => 'Uptown Branch (QC)',
            'email' => 'qc@jspot.com',
            'password' => bcrypt('password'),
            'address' => 'Quezon Memorial Circle, QC',
            'contact_number' => '0919-555-5555',
            'latitude' => 14.6516,
            'longitude' => 121.0493,
            'is_main' => false,
            'user_id' => $uptownUser->id,
        ]);
    }
}
