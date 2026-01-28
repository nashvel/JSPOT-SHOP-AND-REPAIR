<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = \App\Models\Product::with(['branches'])
            ->when(request('search'), function($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return \Inertia\Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:products',
            'price' => 'required|numeric|min:0',
            'branches' => 'array', // Expects logic to assign stock
        ]);

        $product = \App\Models\Product::create($validated);

        // Assign to all branches with 0 stock by default if not specified
        $branchIds = \App\Models\Branch::pluck('id');
        $product->branches()->attach($branchIds, ['stock_quantity' => 0]);

        return redirect()->back()->with('success', 'Product created successfully.');
    }

    public function update(\Illuminate\Http\Request $request, \App\Models\Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
            'price' => 'required|numeric|min:0',
        ]);

        $product->update($validated);

        return redirect()->back()->with('success', 'Product updated successfully.');
    }

    public function destroy(\App\Models\Product $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'Product deleted successfully.');
    }
}
