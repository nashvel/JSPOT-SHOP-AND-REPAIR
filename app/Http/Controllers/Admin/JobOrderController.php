<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\JobOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobOrderController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $jobOrders = JobOrder::with('branch')
            // Filter by branch if user belongs to a branch
            ->when($user->branch_id, function ($query) use ($user) {
                $query->where('branch_id', $user->branch_id);
            })
            // System Admin: filter by selected branch if provided
            ->when(!$user->branch_id && $request->branch_id, function ($query) use ($request) {
                $query->where('branch_id', $request->branch_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $branches = Branch::all();

        return Inertia::render('Admin/JobOrders/Index', [
            'jobOrders' => $jobOrders,
            'branches' => $branches,
            'filters' => $request->only(['branch_id']),
            'userBranchId' => $user->branch_id,
        ]);
    }

    public function edit(JobOrder $jobOrder)
    {
        $user = auth()->user();

        // Check if user has access to this job order
        if ($user->branch_id && $jobOrder->branch_id !== $user->branch_id) {
            abort(403, 'Unauthorized access to this job order.');
        }

        $jobOrder->load('branch');

        return Inertia::render('Admin/JobOrders/Edit', [
            'jobOrder' => $jobOrder
        ]);
    }

    public function update(Request $request, JobOrder $jobOrder)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'description' => 'required|string',
            'vehicle_details' => 'required|string',
        ]);

        $jobOrder->update($validated);

        return redirect()->route('admin.job-orders.index')
            ->with('success', 'Job Order updated successfully!');
    }
}
