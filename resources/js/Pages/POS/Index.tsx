import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function POSIndex({ products }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <div className="flex-1 overflow-y-auto p-6">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search products or scan barcode..."
            className="w-full px-4 py-3 border rounded-lg mb-6"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product: any) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer p-4"
              >
                <div className="aspect-square bg-gray-100 rounded mb-3 flex items-center justify-center">
                  <span className="text-4xl">📦</span>
                </div>
                <h3 className="font-semibold truncate">{product.name}</h3>
                <p className="text-lg font-bold text-indigo-600 mt-2">₱{product.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-96 bg-white border-l shadow-lg flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Current Order</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">No items in cart</div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="mb-4 pb-4 border-b">
                  <div className="flex justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">₱{item.product.price}</p>
                    </div>
                    <button
                      onClick={() => setCart(cart.filter((_, i) => i !== index))}
                      className="text-red-500"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Qty: {item.quantity}</span>
                    <span className="ml-auto font-semibold">₱{(item.quantity * item.product.price).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total:</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => alert('Order processed!')}
              disabled={cart.length === 0}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300"
            >
              Process Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
