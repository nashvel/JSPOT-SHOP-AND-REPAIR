<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $productsQuery = Product::with(['branches', 'category']);

        // If user has a branch, only show products/services assigned to their branch
        if ($user->branch_id) {
            $productsQuery->whereHas('branches', function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            });
        } else {
            // System Admin: filter by selected branch if provided
            if ($request->branch_id) {
                $productsQuery->whereHas('branches', function ($q) use ($request) {
                    $q->where('branch_id', $request->branch_id);
                });
            }
        }

        $products = $productsQuery
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })

            ->when($request->boolean('low_stock'), function ($query) use ($user, $request) {
                // Filter products that have stock <= threshold in the relevant branch
                $query->whereHas('branches', function ($q) use ($user, $request) {
                    if ($user->branch_id) {
                        $q->where('branch_id', $user->branch_id)
                            ->whereRaw('branch_product.stock_quantity <= products.low_stock_threshold');
                    } elseif ($request->branch_id) {
                        $q->where('branch_id', $request->branch_id)
                            ->whereRaw('branch_product.stock_quantity <= products.low_stock_threshold');
                    } else {
                        // System Admin: check if ANY branch has low stock
                        $q->whereRaw('branch_product.stock_quantity <= products.low_stock_threshold');
                    }
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Filter branch stock to show relevant branch
        if ($user->branch_id) {
            $products->getCollection()->transform(function ($product) use ($user) {
                $product->setRelation('branches', $product->branches->where('id', $user->branch_id));
                return $product;
            });
        } elseif ($request->branch_id) {
            // System Admin viewing specific branch
            $products->getCollection()->transform(function ($product) use ($request) {
                $product->setRelation('branches', $product->branches->where('id', $request->branch_id));
                return $product;
            });
        }

        $branches = Branch::all();
        $categories = \App\Models\Category::all();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'branches' => $branches,
            'filters' => $request->only(['search', 'type', 'branch_id', 'low_stock']),
            'userBranchId' => $user->branch_id,
        ]);
    }

    public function store(Request $request)
    {
        $isService = $request->type === 'service';

        $validated = $request->validate([
            'type' => 'required|in:product,service',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|unique:products',
            'price' => $isService ? 'nullable|numeric|min:0' : 'required|numeric|min:0',
            'cost' => $isService ? 'nullable|numeric|min:0' : 'required|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'low_stock_threshold' => 'nullable|integer|min:0',
        ]);

        // For services, set default price and cost if not provided
        if ($isService) {
            $validated['price'] = $validated['price'] ?? 0;
            $validated['cost'] = $validated['cost'] ?? 0;
        }

        $user = auth()->user();
        $product = Product::create($validated);

        // Assign to branches (both products and services)
        // Services use stock_quantity = 0 (not tracked)
        if ($user->branch_id) {
            // Branch user: only assign to their branch
            $product->branches()->attach($user->branch_id, ['stock_quantity' => 0]);
        } else {
            // System admin: assign to all branches
            $branchIds = Branch::pluck('id');
            foreach ($branchIds as $branchId) {
                $product->branches()->attach($branchId, ['stock_quantity' => 0]);
            }
        }

        $typeName = $validated['type'] === 'product' ? 'Product' : 'Service';
        return redirect()->back()->with('success', "{$typeName} created successfully.");
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
            'price' => 'required|numeric|min:0',
            'cost' => 'required|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'low_stock_threshold' => 'nullable|integer|min:0',
        ]);

        // Don't allow changing type after creation
        $product->update($validated);

        $typeName = $product->type === 'product' ? 'Product' : 'Service';
        return redirect()->back()->with('success', "{$typeName} updated successfully.");
    }

    // Note: destroy is removed from here - products can only be deleted from Inventory Management
}
