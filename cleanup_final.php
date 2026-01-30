<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

echo "Starting separated cleanup...\n";

// 1. Drop FK
echo "Attempting to drop FK...\n";
try {
    Schema::table('products', function (Blueprint $table) {
        $table->dropForeign(['category_id']);
    });
    echo "FK drop executed.\n";
} catch (\Throwable $e) {
    echo "FK drop failed (expected if doesn't exist): " . $e->getMessage() . "\n";
}

// 2. Drop Index
echo "Attempting to drop Index...\n";
try {
    Schema::table('products', function (Blueprint $table) {
        $table->dropIndex(['category_id']);
    });
    echo "Index drop executed.\n";
} catch (\Throwable $e) {
    echo "Index drop failed (expected if doesn't exist): " . $e->getMessage() . "\n";
}

// 3. Drop Columns
echo "Attempting to drop Columns...\n";
try {
    Schema::table('products', function (Blueprint $table) {
        $table->dropColumn(['category_id', 'cost']);
    });
    echo "Column drop executed.\n";
} catch (\Throwable $e) {
    echo "Column drop failed: " . $e->getMessage() . "\n";
}

echo "Cleanup complete.\n";
