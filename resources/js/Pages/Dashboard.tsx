import React from 'react';
import { router } from '@inertiajs/react';

interface DashboardProps {
  auth: {
    user: {
      name: string;
      email: string;
      role: string;
    };
  };
  stats: {
    todaySales: number;
    monthSales: number;
    totalOrders: number;
    pendingOrders: number;
  };
  recentOrders: any[];
  lowStockProducts: any[];
}

export default function Dashboard({ auth, stats }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Advanced POS System</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{auth.user.name}</span>
            <button
              onClick={() => router.post('/logout')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-2">Welcome back, {auth.user.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold text-gray-900">₱{stats.todaySales.toLocaleString()}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Month Sales</p>
                <p className="text-2xl font-bold text-gray-900">₱{stats.monthSales.toLocaleString()}</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => router.visit('/pos')}
            className="bg-white rounded-lg shadow hover:shadow-lg p-8 text-center transition"
          >
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-bold text-gray-900">Point of Sale</h3>
            <p className="text-gray-600 mt-2">Process customer orders</p>
          </button>

          <button
            onClick={() => router.visit('/products')}
            className="bg-white rounded-lg shadow hover:shadow-lg p-8 text-center transition"
          >
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900">Products</h3>
            <p className="text-gray-600 mt-2">Manage inventory</p>
          </button>

          <button
            onClick={() => router.visit('/orders')}
            className="bg-white rounded-lg shadow hover:shadow-lg p-8 text-center transition"
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900">Orders</h3>
            <p className="text-gray-600 mt-2">View order history</p>
          </button>

          <button
            onClick={() => router.visit('/customers')}
            className="bg-white rounded-lg shadow hover:shadow-lg p-8 text-center transition"
          >
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900">Customers</h3>
            <p className="text-gray-600 mt-2">Manage customers</p>
          </button>

          <button
            onClick={() => router.visit('/reports')}
            className="bg-white rounded-lg shadow hover:shadow-lg p-8 text-center transition"
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900">Reports</h3>
            <p className="text-gray-600 mt-2">View analytics</p>
          </button>

          {(auth.user.role === 'admin' || auth.user.role === 'developer') && (
            <button
              onClick={() => router.visit('/users')}
              className="bg-white rounded-lg shadow hover:shadow-lg p-8 text-center transition"
            >
              <div className="text-6xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-gray-900">Settings</h3>
              <p className="text-gray-600 mt-2">User management</p>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
