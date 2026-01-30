<?php

/**
 * QR Code Testing Script
 * 
 * This script helps you test QR codes by:
 * 1. Listing all sales with their QR tokens
 * 2. Showing the public receipt URLs
 * 3. Verifying the URLs are accessible
 * 
 * Run: php test_qr_codes.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Sale;

echo "\n=== QR CODE TESTING ===\n\n";

// Get recent sales
$sales = Sale::with(['branch', 'items'])
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();

if ($sales->isEmpty()) {
    echo "❌ No sales found. Create a sale first in the POS.\n\n";
    exit;
}

echo "Found {$sales->count()} recent sales:\n\n";

foreach ($sales as $index => $sale) {
    $hasServices = $sale->items->contains(fn($item) => $item->product_type === 'service');
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Sale #" . ($index + 1) . "\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Sale Number:    {$sale->sale_number}\n";
    echo "Customer:       {$sale->customer_name}\n";
    echo "Branch:         {$sale->branch->name}\n";
    echo "Date:           {$sale->created_at->format('Y-m-d H:i:s')}\n";
    echo "Total:          ₱" . number_format($sale->total, 2) . "\n";
    echo "Has Services:   " . ($hasServices ? 'Yes (Job Order)' : 'No') . "\n";
    echo "\n";
    echo "QR Token:       {$sale->qr_token}\n";
    echo "\n";
    echo "📱 PUBLIC RECEIPT URL:\n";
    echo "   " . url("/receipt/{$sale->qr_token}") . "\n";
    echo "\n";
    echo "🧪 TEST INSTRUCTIONS:\n";
    echo "   1. Open this URL in your browser to verify it works\n";
    echo "   2. Or scan the QR code from the receipt with your phone\n";
    echo "   3. You should see the receipt" . ($hasServices ? ' with job order tracking' : '') . "\n";
    echo "\n";
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

echo "💡 TESTING TIPS:\n\n";
echo "1. PHONE TESTING (Recommended):\n";
echo "   - Run: php artisan serve --host=0.0.0.0 --port=8000\n";
echo "   - Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)\n";
echo "   - Access from phone: http://YOUR_IP:8000\n";
echo "   - Scan QR code with phone camera\n\n";

echo "2. ONLINE QR READER:\n";
echo "   - Take screenshot of QR code\n";
echo "   - Go to: https://webqr.com/\n";
echo "   - Upload screenshot to decode\n\n";

echo "3. DIRECT URL TEST:\n";
echo "   - Copy any URL above\n";
echo "   - Paste in browser to verify receipt loads\n\n";

echo "4. PRINT TEST:\n";
echo "   - Print a receipt\n";
echo "   - Scan printed QR code with phone\n\n";

echo "✅ All URLs above should be accessible!\n\n";
