<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Branch;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $request->query('branch');
        
        $products = Product::with(['category', 'branchInventory' => function($q) use ($branchId) {
            if ($branchId) {
                $q->where('branch_id', $branchId);
            }
        }])
        ->where('is_active', true)
        ->get()
        ->map(function($product) {
            $product->available_quantity = $product->branchInventory->sum('available_quantity');
            return $product;
        });

        $branches = Branch::where('is_active', true)->get();

        return Inertia::render('Public/Shop', [
            'products' => $products,
            'branches' => $branches,
        ]);
    }

    public function createReservation(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string',
            'customer_email' => 'nullable|email',
            'customer_phone' => 'required|string',
            'branch_id' => 'required|exists:branches,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $customer = \App\Models\Customer::firstOrCreate(
            ['phone' => $validated['customer_phone']],
            [
                'name' => $validated['customer_name'],
                'email' => $validated['customer_email'],
                'customer_code' => 'CUST-' . now()->format('YmdHis'),
            ]
        );

        $subtotal = 0;
        foreach ($validated['items'] as $item) {
            $product = Product::find($item['product_id']);
            $subtotal += $product->price * $item['quantity'];
        }

        $order = Order::create([
            'order_number' => 'RES-' . now()->format('YmdHis') . '-' . rand(1000, 9999),
            'branch_id' => $validated['branch_id'],
            'customer_id' => $customer->id,
            'user_id' => 1, // System user
            'type' => 'reservation',
            'status' => 'pending',
            'subtotal' => $subtotal,
            'total' => $subtotal,
            'paid_amount' => 0,
        ]);

        foreach ($validated['items'] as $item) {
            $product = Product::find($item['product_id']);
            \App\Models\OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $product->price,
                'total' => $product->price * $item['quantity'],
            ]);
        }

        return response()->json([
            'message' => 'Reservation created successfully',
            'order_number' => $order->order_number,
        ]);
    }

    public function checkOrder(Request $request, $orderNumber)
    {
        $order = Order::with(['items.product', 'branch'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return Inertia::render('Public/OrderStatus', [
            'order' => $order,
        ]);
    }
}
