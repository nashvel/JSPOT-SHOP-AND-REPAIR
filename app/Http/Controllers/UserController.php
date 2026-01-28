<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with(['branch', 'roles'])->paginate(20);
        $roles = Role::all();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'branch_id' => 'nullable|exists:branches,id',
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'branch_id' => $validated['branch_id'],
        ]);

        $user->assignRole($validated['role']);

        return redirect()->back()->with('success', 'User created successfully');
    }

    public function impersonate(User $user)
    {
        if (!auth()->user()->hasRole('developer')) {
            abort(403, 'Unauthorized');
        }

        session(['impersonate_user_id' => $user->id, 'impersonator_id' => auth()->id()]);

        return redirect()->route('dashboard');
    }

    public function stopImpersonating()
    {
        $impersonatorId = session('impersonator_id');
        session()->forget(['impersonate_user_id', 'impersonator_id']);

        return redirect()->route('dashboard');
    }
}
