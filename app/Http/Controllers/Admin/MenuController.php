<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $menus = \App\Models\Menu::orderBy('order')->get();
        return \Inertia\Inertia::render('Admin/Menus/Index', [
            'menus' => $menus
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return \Inertia\Inertia::render('Admin/Menus/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'route' => 'required|string|max:255',
            'icon' => 'required|string|max:255',
            'order' => 'required|integer',
        ]);

        \App\Models\Menu::create($validated);

        return redirect()->route('admin.menus.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $menu = \App\Models\Menu::findOrFail($id);
        return \Inertia\Inertia::render('Admin/Menus/Edit', [
            'menu' => $menu
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $menu = \App\Models\Menu::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'route' => 'required|string|max:255',
            'icon' => 'required|string|max:255',
            'order' => 'required|integer',
        ]);

        $menu->update($validated);

        return redirect()->route('admin.menus.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        \App\Models\Menu::findOrFail($id)->delete();
        return redirect()->route('admin.menus.index');
    }
}
