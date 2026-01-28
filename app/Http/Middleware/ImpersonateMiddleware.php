<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ImpersonateMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (session()->has('impersonate_user_id')) {
            $userId = session('impersonate_user_id');
            $user = \App\Models\User::find($userId);
            
            if ($user) {
                auth()->setUser($user);
            }
        }

        return $next($request);
    }
}
