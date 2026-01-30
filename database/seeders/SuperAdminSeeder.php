<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the Super Admin role
        $superAdminRole = \App\Models\Role::where('name', 'super_admin')->first();
        
        if (!$superAdminRole) {
            $this->command->error('Super Admin role not found! Please run RoleSeeder first.');
            return;
        }

        // Create Super Admin accounts
        $superAdmins = [
            [
                'name' => 'Nashvel',
                'email' => 'nashvel@jspot.com',
                'password' => Hash::make('password'),
                'role_id' => $superAdminRole->id,
                'branch_id' => null, // Super admins don't belong to a branch
            ],
            [
                'name' => 'Brandon',
                'email' => 'brandon@jspot.com',
                'password' => Hash::make('password'),
                'role_id' => $superAdminRole->id,
                'branch_id' => null,
            ],
        ];

        foreach ($superAdmins as $admin) {
            $user = User::updateOrCreate(
                ['email' => $admin['email']],
                $admin
            );

            // Assign all menus to super admins (13 menus, Super Admin Panel is hardcoded)
            $allMenuIds = \App\Models\Menu::pluck('id')->toArray();
            $user->menus()->sync($allMenuIds);

            $this->command->info("✓ Super Admin created: {$user->email}");
        }

        $this->command->info("\n🔐 Super Admin Credentials:");
        $this->command->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->command->info("Email: nashvel@jspot.com | Password: password");
        $this->command->info("Email: brandon@jspot.com | Password: password");
        $this->command->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }
}
