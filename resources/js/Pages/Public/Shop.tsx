import React from 'react';

export default function Shop({ products, branches }: any) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Motor Shop - Available Products</h1>
          <p className="text-gray-600 mt-2">Reserve your items online</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
                <span className="text-6xl">🏍️</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-indigo-600">₱{product.price}</span>
                  <span className="text-sm text-green-600">Available</span>
                </div>
                <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Reserve
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
