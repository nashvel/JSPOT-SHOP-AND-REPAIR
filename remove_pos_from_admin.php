<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Find System Admin (user without branch_id)
$admin = App\Models\User::where('email', 'admin@example.com')->first();

if ($admin) {
    // Find POS menu
    $posMenu = App\Models\Menu::where('route', 'admin.pos.index')->first();
    
    if ($posMenu) {
        // Remove POS from admin's menus
        $admin->menus()->detach($posMenu->id);
        echo "✅ Removed 'Point of Sale' from System Admin\n";
    } else {
        echo "❌ POS menu not found\n";
    }
    
    echo "\nSystem Admin menus:\n";
    foreach ($admin->menus as $menu) {
        echo "  - {$menu->name}\n";
    }
} else {
    echo "❌ System Admin not found\n";
}
