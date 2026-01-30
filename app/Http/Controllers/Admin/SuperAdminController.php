<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SuperAdminController extends Controller
{
    /**
     * Display a listing of system admins.
     */
    public function index(Request $request)
    {
        // Only super admins can access this
        if (auth()->user()->role?->name !== 'super_admin') {
            abort(403, 'Unauthorized. Only Super Admins can access this page.');
        }

        $admins = User::with('role')
            ->whereNull('branch_id')
            ->whereHas('role', function ($query) {
                $query->where('name', '!=', 'super_admin');
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->withCount('menus')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get all roles from database (exclude super_admin)
        $roles = \App\Models\Role::where('name', '!=', 'super_admin')
            ->orderBy('display_name')
            ->get();

        return Inertia::render('Admin/SuperAdmin/Index', [
            'admins' => $admins,
            'roles' => $roles,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created system admin.
     */
    public function store(Request $request)
    {
        // Only super admins can create system admins
        if (auth()->user()->role?->name !== 'super_admin') {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'branch_id' => null, // System admins don't belong to a branch
        ]);

        // Assign all menus to the new system admin
        $allMenuIds = \App\Models\Menu::pluck('id')->toArray();
        $admin->menus()->sync($allMenuIds);

        return redirect()->route('admin.super-admin.index')
            ->with('success', 'System Admin created successfully!');
    }

    /**
     * Update the specified system admin.
     */
    public function update(Request $request, User $user)
    {
        // Only super admins can update system admins
        if (auth()->user()->role?->name !== 'super_admin') {
            abort(403, 'Unauthorized');
        }

        // Prevent updating super admins
        if ($user->role?->name === 'super_admin') {
            return back()->withErrors(['error' => 'Cannot modify Super Admin accounts.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'] ? Hash::make($validated['password']) : $user->password,
            'role_id' => $validated['role_id'],
        ]);

        return redirect()->route('admin.super-admin.index')
            ->with('success', 'System Admin updated successfully!');
    }

    /**
     * Remove the specified system admin.
     */
    public function destroy(User $user)
    {
        // Only super admins can delete system admins
        if (auth()->user()->role?->name !== 'super_admin') {
            abort(403, 'Unauthorized');
        }

        // Prevent deleting super admins
        if ($user->role?->name === 'super_admin') {
            return back()->withErrors(['error' => 'Cannot delete Super Admin accounts.']);
        }

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        $user->delete();

        return redirect()->route('admin.super-admin.index')
            ->with('success', 'System Admin deleted successfully!');
    }
}
