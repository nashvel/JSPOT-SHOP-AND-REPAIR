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
        $products = Product::with(['branches'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:product,service',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|unique:products',
            'price' => 'required|numeric|min:0',
        ]);

        $product = Product::create($validated);

        // Only assign to branches with stock if it's a product (not service)
        if ($validated['type'] === 'product') {
            $branchIds = Branch::pluck('id');
            $product->branches()->attach($branchIds, ['stock_quantity' => 0]);
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
        ]);

        // Don't allow changing type after creation
        $product->update($validated);

        $typeName = $product->type === 'product' ? 'Product' : 'Service';
        return redirect()->back()->with('success', "{$typeName} updated successfully.");
    }

    // Note: destroy is removed from here - products can only be deleted from Inventory Management
}
