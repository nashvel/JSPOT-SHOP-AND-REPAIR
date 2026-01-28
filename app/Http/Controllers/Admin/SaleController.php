<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $sales = Sale::with(['user', 'branch', 'items'])
            ->when($request->search, function ($query, $search) {
                $query->where('sale_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('plate_number', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->payment_method, function ($query, $method) {
                $query->where('payment_method', $method);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Sales/Index', [
            'sales' => $sales,
            'filters' => $request->only(['search', 'status', 'payment_method']),
        ]);
    }

    public function create()
    {
        $user = auth()->user();

        // Get products with stock for user's branch
        $products = Product::where('type', 'product')
            ->whereHas('branches', function ($query) use ($user) {
                $query->where('branch_id', $user->branch_id)
                    ->where('stock_quantity', '>', 0);
            })->with([
                    'branches' => function ($query) use ($user) {
                        $query->where('branch_id', $user->branch_id);
                    }
                ])->get();

        // Get all services (no stock needed)
        $services = Product::where('type', 'service')->get();

        return Inertia::render('Admin/POS/Index', [
            'products' => $products,
            'services' => $services,
            'employee' => $user->only(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'employee_name' => 'required|string|max:255',
            'engine_number' => 'required|string|max:100',
            'chassis_number' => 'required|string|max:100',
            'plate_number' => 'required|string|max:20',
            'payment_method' => 'required|in:cash,gcash,maya',
            'amount_paid' => 'required|numeric|min:0',
            'reference_number' => 'nullable|string|max:100',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $user = auth()->user();

        return DB::transaction(function () use ($validated, $user) {
            // Calculate totals
            $subtotal = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Only check stock for products, not services
                if ($product->type === 'product') {
                    $branchProduct = $product->branches()
                        ->where('branch_id', $user->branch_id)
                        ->first();

                    if (!$branchProduct || $branchProduct->pivot->stock_quantity < $item['quantity']) {
                        throw new \Exception("Insufficient stock for {$product->name}");
                    }
                }

                $itemTotal = $product->price * $item['quantity'];
                $subtotal += $itemTotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'total' => $itemTotal,
                ];

                // Deduct stock only for products (not services)
                if ($product->type === 'product') {
                    $product->branches()->updateExistingPivot($user->branch_id, [
                        'stock_quantity' => DB::raw("stock_quantity - {$item['quantity']}"),
                    ]);
                }
            }

            $total = $subtotal;
            $change = max(0, $validated['amount_paid'] - $total);

            // Create sale
            $sale = Sale::create([
                'sale_number' => Sale::generateSaleNumber(),
                'branch_id' => $user->branch_id,
                'user_id' => $user->id,
                'customer_name' => $validated['customer_name'],
                'contact_number' => $validated['contact_number'],
                'employee_name' => $validated['employee_name'],
                'engine_number' => $validated['engine_number'],
                'chassis_number' => $validated['chassis_number'],
                'plate_number' => $validated['plate_number'],
                'subtotal' => $subtotal,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'amount_paid' => $validated['amount_paid'],
                'change' => $change,
                'reference_number' => $validated['reference_number'],
                'qr_token' => Sale::generateQrToken(),
                'status' => 'completed',
            ]);

            // Create sale items
            foreach ($itemsData as $itemData) {
                $sale->items()->create($itemData);
            }

            return redirect()->route('admin.sales.show', $sale)
                ->with('success', 'Sale completed successfully!');
        });
    }

    public function show(Sale $sale)
    {
        $sale->load(['user', 'branch', 'items.product', 'returns.approver']);

        return Inertia::render('Admin/Sales/Show', [
            'sale' => $sale,
            'receiptUrl' => route('public.receipt', $sale->qr_token),
        ]);
    }
}
