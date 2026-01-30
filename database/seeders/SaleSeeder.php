<?php

namespace Database\Seeders;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Branch;
use Illuminate\Database\Seeder;

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $branches = Branch::all();
        $products = Product::where('type', 'product')->get();
        $services = Product::where('type', 'service')->get();
        $allProducts = Product::all();

        if ($users->isEmpty() || $branches->isEmpty() || $allProducts->isEmpty()) {
            $this->command->warn('Please seed users, branches, and products first.');
            return;
        }

        $paymentMethods = ['cash', 'gcash', 'maya'];
        $statuses = ['completed', 'completed', 'completed', 'partial_return', 'returned'];

        // Create 50 sample sales
        for ($i = 0; $i < 50; $i++) {
            $user = $users->random();
            $branch = $branches->random();
            $createdAt = now()->subDays(rand(0, 90))->subHours(rand(0, 23));

            // Generate unique sale number for the date
            $date = $createdAt->format('Ymd');
            $lastSale = Sale::whereDate('created_at', $createdAt->toDateString())
                ->orderBy('id', 'desc')
                ->first();
            $sequence = $lastSale ? (int) substr($lastSale->sale_number, -4) + 1 : 1;
            $saleNumber = sprintf('SO-%s-%04d', $date, $sequence);

            $sale = Sale::create([
                'sale_number' => $saleNumber,
                'branch_id' => $branch->id,
                'user_id' => $user->id,
                'customer_name' => fake()->name(),
                'contact_number' => '09' . rand(100000000, 999999999),
                'employee_name' => $user->name,
                'engine_number' => strtoupper(fake()->bothify('??##??####')),
                'chassis_number' => strtoupper(fake()->bothify('??##??####??####')),
                'plate_number' => strtoupper(fake()->bothify('???####')),
                'subtotal' => 0,
                'total' => 0,
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                'amount_paid' => 0,
                'change' => 0,
                'reference_number' => rand(0, 1) ? fake()->numerify('REF-############') : null,
                'qr_token' => Sale::generateQrToken(),
                'status' => $statuses[array_rand($statuses)],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Add 1-5 items to each sale
            $itemCount = rand(1, 5);
            $subtotal = 0;

            for ($j = 0; $j < $itemCount; $j++) {
                $product = $allProducts->random();
                $quantity = rand(1, 3);
                $unitPrice = $product->price;
                $total = $unitPrice * $quantity;
                $subtotal += $total;

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total' => $total,
                ]);
            }

            // Update sale totals
            $amountPaid = $subtotal + rand(0, 500);
            $change = max(0, $amountPaid - $subtotal);

            $sale->update([
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'amount_paid' => $amountPaid,
                'change' => $change,
            ]);
        }

        $this->command->info('Created 50 sample sales with items.');
    }
}
