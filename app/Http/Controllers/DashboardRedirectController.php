<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardRedirectController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        if ($user->role === 'director') {
            return redirect()->route('director.dashboard');
        }
        if ($user->role === 'overall_ic') {
            return redirect()->route('overall.dashboard');
        }
        if ($user->role === 'area_ic') {
            return redirect()->route('area.dashboard');
        }

        return \Inertia\Inertia::render('Dashboard');
    }
}
