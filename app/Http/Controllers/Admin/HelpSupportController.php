<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HelpSupportController extends Controller
{
    public function index()
    {
        return \Inertia\Inertia::render('Admin/HelpSupport/Index');
    }
}
