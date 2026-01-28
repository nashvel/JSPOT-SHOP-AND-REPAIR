<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\BranchInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class POSController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $request->user()->branch_id;
        
        $products = Product::with(['category', 'branchInventory' => function($q) use ($branchId) {
            $q->where('branch_id', $branchId);
        }])->where('is_active', true)->get();

        $customers = Customer::all();

        return Inertia::render('POS/Index', [
            'products' => $products,
            'customers' => $customers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'type' => 'required|in:sale,reservation,service',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'payments' => 'required|array|min:1',
            'payments.*.method' => 'required|string',
            'payments.*.amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $subtotal = collect($validated['items'])->sum(fn($item) => 
                $item['quantity'] * $item['unit_price']
            );

            $order = Order::create([
                'order_number' => 'ORD-' . now()->format('YmdHis') . '-' . rand(1000, 9999),
                'branch_id' => $request->user()->branch_id,
                'customer_id' => $validated['customer_id'] ?? null,
                'user_id' => $request->user()->id,
                'type' => $validated['type'],
                'status' => $validated['type'] === 'reservation' ? 'pending' : 'completed',
                'subtotal' => $subtotal,
                'tax' => $validated['tax'] ?? 0,
                'discount' => $validated['discount'] ?? 0,
                'total' => $subtotal + ($validated['tax'] ?? 0) - ($validated['discount'] ?? 0),
                'paid_amount' => collect($validated['payments'])->sum('amount'),
                'notes' => $validated['notes'] ?? null,
                'completed_at' => $validated['type'] !== 'reservation' ? now() : null,
            ]);

            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);

                if ($validated['type'] === 'reservation') {
                    BranchInventory::where('branch_id', $request->user()->branch_id)
                        ->where('product_id', $item['product_id'])
                        ->increment('reserved_quantity', $item['quantity']);
                } else {
                    BranchInventory::where('branch_id', $request->user()->branch_id)
                        ->where('product_id', $item['product_id'])
                        ->decrement('quantity', $item['quantity']);
                }
            }

            foreach ($validated['payments'] as $payment) {
                Payment::create([
                    'order_id' => $order->id,
                    'payment_method' => $payment['method'],
                    'amount' => $payment['amount'],
                    'reference_number' => $payment['reference'] ?? null,
                ]);
            }

            return redirect()->route('pos.index')->with('success', 'Order created successfully');
        });
    }

    public function searchByBarcode(Request $request)
    {
        $barcode = $request->input('barcode');
        $product = Product::where('barcode', $barcode)
            ->orWhere('sku', $barcode)
            ->with('category')
            ->first();

        return response()->json($product);
    }
}
