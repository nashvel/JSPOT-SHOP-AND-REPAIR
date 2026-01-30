<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Menu;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    /**
     * Branch Accounts page - table with staff management
     */
    public function index()
    {
        // Get all branches with their staff and menus
        $branches = Branch::with(['staff.role', 'menus'])
            ->withCount('staff')
            ->get();

        return Inertia::render('Admin/Branches/Index', [
            'branches' => $branches,
        ]);
    }

    /**
     * Branch Locations page - map view
     */
    public function locations()
    {
        $branches = Branch::all();

        return Inertia::render('Admin/Branches/Locations', [
            'branches' => $branches,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Branches/Create', [
            'availableMenus' => Menu::orderBy('order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:branches,email|unique:users,email',
            'password' => 'required|string|min:8',
            'address' => 'nullable|string|max:500',
            'contact_number' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_main' => 'boolean',
            'menus' => 'array',
            'menus.*' => 'exists:menus,id',
        ]);

        $branch = Branch::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'address' => $validated['address'] ?? null,
            'contact_number' => $validated['contact_number'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'is_main' => $validated['is_main'] ?? false,
        ]);

        // Sync menus
        if (isset($validated['menus'])) {
            $branch->menus()->sync($validated['menus']);
        }

        // Create a user account for the branch so they can log in
        User::create([
            'name' => $validated['name'] . ' (Branch Account)',
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'manager', // Use string role field
            'branch_id' => $branch->id,
        ]);

        return redirect()->route('admin.branches.index')
            ->with('success', 'Branch created successfully! Branch can now log in with their email and password.');
    }

    public function edit(Branch $branch)
    {
        $branch->load(['menus', 'staff.role', 'staff.menus']);

        return Inertia::render('Admin/Branches/Edit', [
            'branch' => $branch,
            'availableMenus' => Menu::orderBy('order')->get(),
            'roles' => Role::all(),
        ]);
    }

    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:branches,email,' . $branch->id,
            'address' => 'nullable|string|max:500',
            'contact_number' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_main' => 'boolean',
            'menus' => 'array',
            'menus.*' => 'exists:menus,id',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'address' => $validated['address'] ?? null,
            'contact_number' => $validated['contact_number'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'is_main' => $validated['is_main'] ?? false,
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = bcrypt($request->password);
        }

        $branch->update($updateData);

        // Sync menus
        $branch->menus()->sync($validated['menus'] ?? []);

        return redirect()->route('admin.branches.index')
            ->with('success', 'Branch updated successfully!');
    }

    public function destroy(Branch $branch)
    {
        // Check if branch has staff
        if ($branch->staff()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete branch with assigned staff.');
        }

        $branch->delete();

        return redirect()->route('admin.branches.index')
            ->with('success', 'Branch deleted successfully!');
    }

    /**
     * Add staff to a branch
     */
    public function addStaff(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role_id' => $validated['role_id'],
            'branch_id' => $branch->id,
        ]);

        return redirect()->back()
            ->with('success', 'Staff added successfully!');
    }

    /**
     * Remove staff from a branch
     */
    public function removeStaff(Branch $branch, User $user)
    {
        if ($user->branch_id !== $branch->id) {
            return redirect()->back()
                ->with('error', 'Staff does not belong to this branch.');
        }

        $user->delete();

        return redirect()->back()
            ->with('success', 'Staff removed successfully!');
    }

    /**
     * Update menus for a specific staff member
     */
    public function updateStaffMenus(Request $request, Branch $branch, User $user)
    {
        if ($user->branch_id !== $branch->id) {
            return redirect()->back()
                ->with('error', 'Staff does not belong to this branch.');
        }

        $validated = $request->validate([
            'menus' => 'array',
            'menus.*' => 'exists:menus,id',
        ]);

        $user->menus()->sync($validated['menus'] ?? []);

        return redirect()->back()
            ->with('success', 'Staff permissions updated successfully!');
    }
}
