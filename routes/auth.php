<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::middleware('guest')->group(function () {
    Route::get('login', function () {
        return inertia('Auth/Login');
    })->name('login');

    Route::post('login', function (Request $request) {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (auth()->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            
            // Update last login
            auth()->user()->update(['last_login_at' => now()]);

            return redirect()->intended('dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    })->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', function (Request $request) {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    })->name('logout');
});
