<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Super Admin Verification ===\n\n";

// Check roles
echo "Roles in database:\n";
$roles = \App\Models\Role::all();
foreach ($roles as $role) {
    echo "  - {$role->display_name} (name: {$role->name}, id: {$role->id})\n";
}

echo "\n";

// Check Super Admin users
echo "Super Admin users:\n";
$superAdmins = \App\Models\User::with('role')
    ->whereHas('role', function($q) {
        $q->where('name', 'super_admin');
    })
    ->get();

foreach ($superAdmins as $admin) {
    echo "  - {$admin->name} ({$admin->email})\n";
    echo "    Role ID: {$admin->role_id}\n";
    echo "    Role Name: {$admin->role->name}\n";
    echo "    Role Display: {$admin->role->display_name}\n";
    echo "    Branch ID: " . ($admin->branch_id ?? 'null') . "\n";
    echo "\n";
}

echo "✓ Verification complete!\n";
