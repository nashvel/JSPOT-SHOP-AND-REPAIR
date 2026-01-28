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
        $returns = SalesReturn::with(['sale.user', 'sale.branch', 'saleItem', 'approver'])
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Returns/Index', [
            'returns' => $returns,
            'filters' => $request->only(['status']),
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

            // Restore stock
            $sale = $return->sale;
            $saleItem = $return->saleItem;

            $saleItem->product->branches()->updateExistingPivot($sale->branch_id, [
                'stock_quantity' => DB::raw("stock_quantity + {$return->quantity}"),
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

        return back()->with('success', 'Return approved successfully.');
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
