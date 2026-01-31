<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
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
        $user = auth()->user();

        $sales = Sale::with(['user', 'branch', 'items'])
            // Filter by branch if user belongs to a branch
            ->when($user->branch_id, function ($query) use ($user) {
                $query->where('branch_id', $user->branch_id);
            })
            // System Admin: filter by selected branch if provided
            ->when(!$user->branch_id && $request->branch_id, function ($query) use ($request) {
                $query->where('branch_id', $request->branch_id);
            })
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
            ->when($request->start_date, function ($query, $startDate) {
                $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($request->end_date, function ($query, $endDate) {
                $query->whereDate('created_at', '<=', $endDate);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $branches = Branch::all();

        return Inertia::render('Admin/Sales/Index', [
            'sales' => $sales,
            'branches' => $branches,
            'filters' => $request->only(['search', 'status', 'payment_method', 'start_date', 'end_date', 'branch_id']),
            'userBranchId' => $user->branch_id,
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();

        // Determine which branch to use
        $branchId = $user->branch_id; // Branch users use their own branch

        // System Admin: use selected branch or default to first branch
        if (!$branchId) {
            $branchId = $request->branch_id ?? Branch::first()?->id;

            if (!$branchId) {
                return redirect()->route('admin.dashboard')
                    ->with('error', 'No branches available. Please create a branch first.');
            }
        }

        // Get products with stock for the selected branch
        $products = Product::where('type', 'product')
            ->whereHas('branches', function ($query) use ($branchId) {
                $query->where('branch_id', $branchId)
                    ->where('stock_quantity', '>', 0);
            })
            ->with([
                'branches' => function ($query) use ($branchId) {
                    $query->where('branch_id', $branchId);
                },
                'category'
            ])
            ->get();

        // Get services assigned to the selected branch
        $services = Product::where('type', 'service')
            ->whereHas('branches', function ($query) use ($branchId) {
                $query->where('branch_id', $branchId);
            })
            ->with('category')
            ->get();

        $categories = \App\Models\Category::all();

        // Get active mechanics for the selected branch
        $mechanics = \App\Models\Mechanic::where('branch_id', $branchId)
            ->where('is_active', true)
            ->get();

        // Get all branches for System Admin dropdown
        $branches = !$user->branch_id ? Branch::all() : collect();

        return Inertia::render('Admin/POS/Index', [
            'products' => $products,
            'services' => $services,
            'categories' => $categories,
            'mechanics' => $mechanics,
            'employee' => $user->only(['id', 'name']),
            'branches' => $branches,
            'selectedBranch' => $branchId,
            'canSelectBranch' => !$user->branch_id, // Only System Admin can select branch
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'employee_name' => 'required|string|max:255',
            'mechanic_id' => 'nullable|exists:mechanics,id',
            'engine_number' => 'required|string|max:100',
            'chassis_number' => 'required|string|max:100',
            'plate_number' => 'required|string|max:20',
            'payment_method' => 'required|in:cash,gcash,maya',
            'amount_paid' => 'required|numeric|min:0',
            'reference_number' => 'nullable|string|max:100',
            'job_description' => 'nullable|string|max:1000', // For job order description
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'branch_id' => 'nullable|exists:branches,id', // For System Admin
        ]);

        $user = auth()->user();

        // Determine which branch to use
        $branchId = $user->branch_id ?? $validated['branch_id'] ?? null;

        if (!$branchId) {
            return back()->withErrors(['branch_id' => 'Branch is required.']);
        }

        return DB::transaction(function () use ($validated, $user, $request, $branchId) {
            // Calculate totals and check for services
            $subtotal = 0;
            $itemsData = [];
            $hasServices = false;
            $serviceItems = [];
            $productItems = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->type === 'service') {
                    $hasServices = true;
                    $serviceItems[] = [
                        'product' => $product,
                        'quantity' => $item['quantity'],
                    ];
                }

                // Only check stock for products, not services
                if ($product->type === 'product') {
                    $branchProduct = $product->branches()
                        ->where('branch_id', $branchId)
                        ->first();

                    if (!$branchProduct || $branchProduct->pivot->stock_quantity < $item['quantity']) {
                        throw new \Exception("Insufficient stock for {$product->name}");
                    }

                    $productItems[] = [
                        'product' => $product,
                        'quantity' => $item['quantity'],
                    ];
                }

                $itemTotal = $product->price * $item['quantity'];
                $subtotal += $itemTotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_type' => $product->type,
                    'category_name' => $product->category ? $product->category->name : null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'total' => $itemTotal,
                ];

                // Deduct stock only for products (not services)
                if ($product->type === 'product') {
                    $product->branches()->updateExistingPivot($branchId, [
                        'stock_quantity' => DB::raw("stock_quantity - {$item['quantity']}"),
                    ]);
                }
            }

            $total = $subtotal;
            $change = max(0, $validated['amount_paid'] - $total);

            // Create sale
            $sale = Sale::create([
                'sale_number' => Sale::generateSaleNumber(),
                'branch_id' => $branchId,
                'user_id' => $user->id,
                'mechanic_id' => $validated['mechanic_id'] ?? null,
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

            // If there are services, create a job order
            if ($hasServices) {
                $serviceDescription = collect($serviceItems)->map(function ($item) {
                    return "{$item['product']->name} (x{$item['quantity']})";
                })->join(', ');

                $laborCost = collect($serviceItems)->sum(function ($item) {
                    return $item['product']->price * $item['quantity'];
                });

                $partsCost = collect($productItems)->sum(function ($item) {
                    return $item['product']->price * $item['quantity'];
                });

                // Use custom description if provided, otherwise use auto-generated service list
                $jobDescription = !empty($validated['job_description'])
                    ? $validated['job_description']
                    : "Services: {$serviceDescription}";

                $jobOrder = \App\Models\JobOrder::create([
                    'tracking_code' => \App\Models\JobOrder::generateTrackingCode(),
                    'branch_id' => $branchId,
                    'sale_id' => $sale->id,
                    'mechanic_id' => $validated['mechanic_id'] ?? null,
                    'customer_name' => $validated['customer_name'],
                    'contact_number' => $validated['contact_number'],
                    'vehicle_details' => "Plate: {$validated['plate_number']}",
                    'engine_number' => $validated['engine_number'],
                    'chassis_number' => $validated['chassis_number'],
                    'plate_number' => $validated['plate_number'],
                    'description' => $jobDescription,
                    'labor_cost' => $laborCost,
                    'parts_cost' => $partsCost,
                    'total_cost' => $laborCost + $partsCost,
                    'status' => 'pending',
                ]);

                // Note: Labor earnings will be added to mechanic when job status is changed to 'completed'

                // Add purchased products as parts to job order
                foreach ($productItems as $productItem) {
                    \App\Models\JobOrderPart::create([
                        'job_order_id' => $jobOrder->id,
                        'product_id' => $productItem['product']->id,
                        'part_name' => $productItem['product']->name,
                        'quantity' => $productItem['quantity'],
                        'unit_price' => $productItem['product']->price,
                        'total_price' => $productItem['product']->price * $productItem['quantity'],
                        'source' => 'purchased',
                    ]);
                }
            }

            return redirect()->route('admin.sales.show', $sale)
                ->with('success', 'Sale completed successfully!' . ($hasServices ? ' Job order created.' : ''));
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
