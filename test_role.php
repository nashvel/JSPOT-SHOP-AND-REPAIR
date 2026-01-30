<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\User::find(1);

echo "User: {$user->name}\n";
echo "Role ID: {$user->role_id}\n";
echo "Role attribute type: " . gettype($user->role) . "\n";
echo "Role attribute value: " . var_export($user->role, true) . "\n";

echo "\n--- With eager loading ---\n";
$user2 = \App\Models\User::with('role')->find(1);
echo "Role attribute type: " . gettype($user2->role) . "\n";
echo "Role attribute value: " . var_export($user2->role, true) . "\n";

if (is_object($user2->role)) {
    echo "Role name: {$user2->role->name}\n";
    echo "Role display: {$user2->role->display_name}\n";
}
