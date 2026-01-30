<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mechanic;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MechanicController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $mechanics = Mechanic::with('branch')
            // Filter by branch if user belongs to a branch
            ->when($user->branch_id, function ($query) use ($user) {
                $query->where('branch_id', $user->branch_id);
            })
            // System Admin: filter by selected branch if provided
            ->when(!$user->branch_id && $request->branch_id, function ($query) use ($request) {
                $query->where('branch_id', $request->branch_id);
            })
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('specialization', 'like', "%{$search}%");
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('is_active', $request->status === 'active');
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Show all branches for system admin, only user's branch for branch users
        $branches = $user->branch_id 
            ? Branch::where('id', $user->branch_id)->get()
            : Branch::all();

        return Inertia::render('Admin/Mechanics/Index', [
            'mechanics' => $mechanics,
            'branches' => $branches,
            'filters' => $request->only(['search', 'branch_id', 'status']),
            'userBranchId' => $user->branch_id,
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        
        // Only show branches the user has access to
        $branches = $user->branch_id 
            ? Branch::where('id', $user->branch_id)->get()
            : Branch::all();

        return Inertia::render('Admin/Mechanics/Create', [
            'branches' => $branches,
            'userBranchId' => $user->branch_id,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:mechanics,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'hire_date' => 'nullable|date',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'is_active' => 'boolean',
        ]);

        // If user has a branch, force the mechanic to belong to that branch
        if ($user->branch_id) {
            $validated['branch_id'] = $user->branch_id;
        }

        Mechanic::create($validated);

        return redirect()->route('admin.mechanics.index')
            ->with('success', 'Mechanic created successfully!');
    }

    public function edit(Mechanic $mechanic)
    {
        $user = auth()->user();

        // Check if user has access to this mechanic
        if ($user->branch_id && $mechanic->branch_id !== $user->branch_id) {
            abort(403, 'Unauthorized access to this mechanic.');
        }

        // Only show branches the user has access to
        $branches = $user->branch_id 
            ? Branch::where('id', $user->branch_id)->get()
            : Branch::all();

        return Inertia::render('Admin/Mechanics/Edit', [
            'mechanic' => $mechanic->load('branch'),
            'branches' => $branches,
            'userBranchId' => $user->branch_id,
        ]);
    }

    public function update(Request $request, Mechanic $mechanic)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:mechanics,email,' . $mechanic->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'hire_date' => 'nullable|date',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'is_active' => 'boolean',
        ]);

        $mechanic->update($validated);

        return redirect()->route('admin.mechanics.index')
            ->with('success', 'Mechanic updated successfully!');
    }

    public function destroy(Mechanic $mechanic)
    {
        // Check if mechanic has active job orders
        if ($mechanic->jobOrders()->whereIn('status', ['pending', 'in-progress'])->exists()) {
            return back()->with('error', 'Cannot delete mechanic with active job orders.');
        }

        $mechanic->delete();

        return redirect()->route('admin.mechanics.index')
            ->with('success', 'Mechanic deleted successfully!');
    }

    public function toggleStatus(Mechanic $mechanic)
    {
        $mechanic->update(['is_active' => !$mechanic->is_active]);

        return back()->with('success', 'Mechanic status updated successfully!');
    }

    public function laborHistory(Mechanic $mechanic)
    {
        $jobOrders = $mechanic->jobOrders()
            ->with(['sale', 'parts'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Mechanics/LaborHistory', [
            'mechanic' => $mechanic->load('branch'),
            'jobOrders' => $jobOrders,
        ]);
    }
}
