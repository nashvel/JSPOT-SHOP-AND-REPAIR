<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SalesReturn;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReturnController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $returns = SalesReturn::with(['sale.user', 'sale.branch', 'saleItem', 'approver'])
            // Filter by branch if user belongs to a branch
            ->when($user->branch_id, function ($query) use ($user) {
                $query->whereHas('sale', function ($q) use ($user) {
                    $q->where('branch_id', $user->branch_id);
                });
            })
            // System Admin: filter by selected branch if provided
            ->when(!$user->branch_id && $request->branch_id, function ($query) use ($request) {
                $query->whereHas('sale', function ($q) use ($request) {
                    $q->where('branch_id', $request->branch_id);
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $branches = \App\Models\Branch::all();

        return Inertia::render('Admin/Returns/Index', [
            'returns' => $returns,
            'branches' => $branches,
            'filters' => $request->only(['status', 'branch_id']),
            'userBranchId' => $user->branch_id,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'sale_item_id' => 'required|exists:sale_items,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:1000',
        ]);

        // Verify quantity doesn't exceed original
        $saleItem = \App\Models\SaleItem::findOrFail($validated['sale_item_id']);
        $existingReturns = SalesReturn::where('sale_item_id', $saleItem->id)
            ->whereIn('status', ['pending', 'approved'])
            ->sum('quantity');

        if ($validated['quantity'] > ($saleItem->quantity - $existingReturns)) {
            return back()->withErrors(['quantity' => 'Return quantity exceeds available quantity.']);
        }

        SalesReturn::create($validated);

        return back()->with('success', 'Return request submitted. Waiting for admin approval.');
    }

    public function approve(SalesReturn $return)
    {
        if (!$return->isPending()) {
            return back()->withErrors(['error' => 'This return has already been processed.']);
        }

        DB::transaction(function () use ($return) {
            $return->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'processed_at' => now(),
            ]);

            // Get sale and sale item
            $sale = $return->sale;
            $saleItem = $return->saleItem;

            // Calculate return amount
            $returnAmount = $saleItem->unit_price * $return->quantity;

            // Restore stock (only for products, not services)
            if ($saleItem->product_type === 'product') {
                $saleItem->product->branches()->updateExistingPivot($sale->branch_id, [
                    'stock_quantity' => DB::raw("stock_quantity + {$return->quantity}"),
                ]);
            }

            // Deduct return amount from sale totals
            $newSubtotal = max(0, $sale->subtotal - $returnAmount);
            $newTotal = max(0, $sale->total - $returnAmount);
            
            $sale->update([
                'subtotal' => $newSubtotal,
                'total' => $newTotal,
            ]);

            // Update sale status
            $totalItems = $sale->items->sum('quantity');
            $totalReturned = SalesReturn::where('sale_id', $sale->id)
                ->where('status', 'approved')
                ->sum('quantity');

            if ($totalReturned >= $totalItems) {
                $sale->update(['status' => 'returned']);
            } else if ($totalReturned > 0) {
                $sale->update(['status' => 'partial_return']);
            }
        });

        return back()->with('success', 'Return approved successfully. Sale total has been adjusted.');
    }

    public function reject(SalesReturn $return)
    {
        if (!$return->isPending()) {
            return back()->withErrors(['error' => 'This return has already been processed.']);
        }

        $return->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'processed_at' => now(),
        ]);

        return back()->with('success', 'Return rejected.');
    }
}
