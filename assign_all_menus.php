<?php

/**
 * Assign All Menus Script
 * 
 * This script assigns appropriate menus to all users:
 * - System Admin: Gets all menus
 * - Branch Users: Gets operational menus only (no admin features)
 * 
 * Usage: php assign_all_menus.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "\n";
echo "╔════════════════════════════════════════════════╗\n";
echo "║     JSPOT Menu Assignment Script              ║\n";
echo "╚════════════════════════════════════════════════╝\n";
echo "\n";

// ============================================
// STEP 1: Get all menus
// ============================================
echo "📋 Step 1: Loading menus...\n";
$allMenus = App\Models\Menu::orderBy('order')->get();

if ($allMenus->isEmpty()) {
    echo "❌ ERROR: No menus found in database!\n";
    exit(1);
}

echo "✓ Found {$allMenus->count()} menus\n\n";

// ============================================
// STEP 2: Assign to System Admin
// ============================================
echo "👑 Step 2: Assigning menus to System Admin users...\n";
$adminUsers = App\Models\User::whereNull('branch_id')->get();

if ($adminUsers->isEmpty()) {
    echo "⚠ No System Admin users found\n\n";
} else {
    $allMenuIds = $allMenus->pluck('id')->toArray();
    
    foreach ($adminUsers as $user) {
        $user->menus()->sync($allMenuIds);
        echo "  ✓ {$user->name} ({$user->email}) - {$allMenus->count()} menus\n";
    }
    echo "\n";
}

// ============================================
// STEP 3: Assign to Branch Users
// ============================================
echo "🏢 Step 3: Assigning menus to Branch users...\n";
$branchUsers = App\Models\User::whereNotNull('branch_id')->get();

if ($branchUsers->isEmpty()) {
    echo "⚠ No Branch users found\n\n";
} else {
    // Branch users get operational menus only
    $branchMenuRoutes = [
        'admin.dashboard',
        'admin.pos.index',
        'admin.job-orders.index',
        'admin.sales.index',
        'admin.returns.index',
        'admin.products.index',
        'admin.stocks.index',
        'admin.mechanics.index',
    ];
    
    $branchMenus = App\Models\Menu::whereIn('route', $branchMenuRoutes)->get();
    $branchMenuIds = $branchMenus->pluck('id')->toArray();
    
    foreach ($branchUsers as $user) {
        $user->menus()->sync($branchMenuIds);
        $branchName = $user->branch ? $user->branch->name : 'Unknown';
        echo "  ✓ {$user->name} - {$branchName} - {$branchMenus->count()} menus\n";
    }
    echo "\n";
}

// ============================================
// SUMMARY
// ============================================
echo "╔════════════════════════════════════════════════╗\n";
echo "║              ASSIGNMENT SUMMARY                ║\n";
echo "╠════════════════════════════════════════════════╣\n";
echo "║ Total Menus:        " . str_pad($allMenus->count(), 25) . "║\n";
echo "║ System Admin Users: " . str_pad($adminUsers->count(), 25) . "║\n";
echo "║ Branch Users:       " . str_pad($branchUsers->count(), 25) . "║\n";
echo "╚════════════════════════════════════════════════╝\n";
echo "\n";
echo "✅ SUCCESS! All menus have been assigned.\n\n";

// ============================================
// MENU LIST
// ============================================
echo "📋 Available Menus:\n";
echo "─────────────────────────────────────────────────\n";
foreach ($allMenus as $menu) {
    $icon = str_pad($menu->icon, 20);
    echo "  {$menu->order}. {$menu->name} ({$menu->group})\n";
}
echo "\n";
