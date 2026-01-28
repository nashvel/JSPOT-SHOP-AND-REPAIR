import React, { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';

export default function Login({ errors = {} }: any) {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [processing, setProcessing] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    router.post('/login', form, { onFinish: () => setProcessing(false) });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Advanced POS System</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to your account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={submit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              type="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Email address"
            />
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Password"
            />
          </div>

          {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}

          <button
            type="submit"
            disabled={processing}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            Sign in
          </button>

          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold">Demo: dev@motorshop.com / password</p>
          </div>
        </form>
      </div>
    </div>
  );
}
