<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        // Get products only (not services) with branch stock
        $products = Product::where('type', 'product')
            ->with([
                'branches' => function ($query) use ($user) {
                    // If user has a branch, show only that branch's stock
                    if ($user->branch_id) {
                        $query->where('branch_id', $user->branch_id);
                    }
                }
            ])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            })
            ->paginate(15)
            ->withQueryString();

        $branches = Branch::all();

        return Inertia::render('Admin/Stocks/Index', [
            'products' => $products,
            'branches' => $branches,
            'filters' => $request->only(['search']),
            'userBranchId' => $user->branch_id,
        ]);
    }

    public function adjustStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'adjustment' => 'required|integer',
            'type' => 'required|in:add,subtract',
            'reason' => 'nullable|string|max:500',
        ]);

        $branchProduct = $product->branches()->where('branch_id', $validated['branch_id'])->first();

        if (!$branchProduct) {
            // Attach if not exists
            $product->branches()->attach($validated['branch_id'], ['stock_quantity' => 0]);
            $branchProduct = $product->branches()->where('branch_id', $validated['branch_id'])->first();
        }

        $currentStock = $branchProduct->pivot->stock_quantity;
        $adjustment = abs($validated['adjustment']);

        if ($validated['type'] === 'add') {
            $newStock = $currentStock + $adjustment;
        } else {
            $newStock = max(0, $currentStock - $adjustment);
        }

        $product->branches()->updateExistingPivot($validated['branch_id'], [
            'stock_quantity' => $newStock,
        ]);

        $action = $validated['type'] === 'add' ? 'added to' : 'subtracted from';
        return redirect()->back()->with('success', "Stock {$action} {$product->name} successfully.");
    }

    public function destroy(Product $product)
    {
        // Only allow deleting products (not services) from inventory management
        if ($product->type !== 'product') {
            return redirect()->back()->with('error', 'Services cannot be deleted from inventory.');
        }

        $product->delete();
        return redirect()->back()->with('success', 'Product deleted successfully.');
    }
}
