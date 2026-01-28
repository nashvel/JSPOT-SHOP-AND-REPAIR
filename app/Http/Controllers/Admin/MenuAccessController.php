<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MenuAccessController extends Controller
{
    public function index(Request $request)
    {
        $users = \App\Models\User::where('id', '!=', $request->user()->id)->get();
        return \Inertia\Inertia::render('Admin/Menus/Users/Index', [
            'users' => $users
        ]);
    }

    public function show($id)
    {
        $user = \App\Models\User::with('menus')->findOrFail($id);
        return \Inertia\Inertia::render('Admin/Menus/Users/Show', [
            'targetUser' => $user
        ]);
    }
}
