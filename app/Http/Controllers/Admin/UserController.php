<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('role')->get();
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'availableMenus' => Menu::all(),
            'roles' => Role::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create', [
            'availableMenus' => Menu::all(),
            'roles' => Role::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'menus' => 'array',
            'menus.*' => 'exists:menus,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role_id' => $validated['role_id'],
        ]);

        if (isset($validated['menus'])) {
            $user->menus()->sync($validated['menus']);
        }

        return redirect()->route('admin.users.index')->with('success', 'User created successfully!');
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        $user = User::with(['menus', 'role'])->findOrFail($id);
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'availableMenus' => Menu::all(),
            'roles' => Role::all(),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role_id' => 'required|exists:roles,id',
            'menus' => 'array',
            'menus.*' => 'exists:menus,id',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role_id' => $validated['role_id'],
        ]);

        if ($request->filled('password')) {
            $user->update(['password' => bcrypt($request->password)]);
        }

        // Sync menus - always sync even if empty array to allow removing all menus
        $user->menus()->sync($validated['menus'] ?? []);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully!');
    }

    public function destroy(string $id)
    {
        User::findOrFail($id)->delete();
        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully!');
    }
}
