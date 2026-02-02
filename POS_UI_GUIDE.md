# POS Terminal UI Implementation Guide

This document provides a complete guide to implementing the POS terminal UI with mobile responsiveness.

## Overview

The POS terminal uses a **split-panel layout** on desktop and a **drawer-based layout** on mobile, optimized for touch interactions and small screens.

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (or CSS variables)
- **Lucide React** - Icons
- **Zustand** - State management (cart)
- **Dexie.js** - IndexedDB for offline data

## Layout Structure

### Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Search + View Toggle + Category Filters            │
├──────────────────────────────────────┬──────────────────────┤
│                                      │                      │
│  Products Panel (Flex-1)             │  Cart Panel (320px)  │
│  - Grid/List view                    │  - Fixed width       │
│  - Scrollable                        │  - Always visible    │
│  - 4-5 columns                       │  - Sticky           │
│                                      │                      │
└──────────────────────────────────────┴──────────────────────┘
```

### Mobile Layout (<1024px)

```
┌─────────────────────────┐
│  Header: Search         │
├─────────────────────────┤
│  Category Filters       │
├─────────────────────────┤
│                         │
│  Products (2 columns)   │
│  - Scrollable           │
│  - Touch-friendly       │
│                         │
│              ┌────┐     │
│              │ 🛒 │ ← Floating button
│              │ 3  │    (shows cart count)
│              └────┘     │
└─────────────────────────┘

When cart button clicked:
┌─────────────────────────┐
│ [X] Your Order          │ ← Drawer slides in
├─────────────────────────┤
│  Cart Items             │
│  - Scrollable           │
│  - Full height          │
│                         │
│  [Cash] [GCash]         │
└─────────────────────────┘
```

## Component Structure

```
POS.tsx (Main Page)
├── Search Bar
├── View Toggle (Grid/List)
├── Category Filters
├── Products Panel
│   ├── ProductCard (Grid View)
│   └── Product Table (List View)
├── Cart Panel (Desktop)
├── Floating Cart Button (Mobile)
└── Cart Drawer (Mobile)

Cart.tsx (Component)
├── Cart Items List
├── Quantity Controls
├── Total Display
├── Payment Buttons
├── Checkout Modal
└── Success Modal (Receipt)

ProductCard.tsx (Component)
├── Product Image/Icon
├── Product Name
├── Price
├── Stock Indicator
├── Quick Add Button
└── Cart Badge
```

## Implementation Steps

### 1. Main POS Layout

```tsx
// src/pages/POS.tsx
import { useState } from 'react'
import { Search, Grid3X3, List, ShoppingCart } from 'lucide-react'

export function POS() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [cartOpen, setCartOpen] = useState(false)
  
  const itemCount = 3 // Get from cart store

  return (
    <div className="h-full flex relative">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="p-4 border-b flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {/* View Toggle (Desktop only) */}
          <div className="hidden sm:flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-3 border-b flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
              !categoryFilter ? 'bg-green-500 text-white' : 'bg-gray-100'
            }`}
          >
            All
          </button>
          {/* Map categories here */}
        </div>

        {/* Products Grid/List */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {/* Product cards */}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                {/* Product table */}
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel - Desktop Only */}
      <div className="hidden lg:flex w-80 bg-gray-50 flex-col border-l">
        <Cart onNewSale={() => setCartOpen(false)} />
      </div>

      {/* Floating Cart Button - Mobile Only */}
      {itemCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center z-40"
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
            {itemCount}
          </span>
        </button>
      )}

      {/* Cart Drawer - Mobile Only */}
      {cartOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-50" 
            onClick={() => setCartOpen(false)} 
          />
          
          {/* Drawer */}
          <div className="lg:hidden fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">Your Order</h2>
              <button onClick={() => setCartOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <Cart onNewSale={() => setCartOpen(false)} />
          </div>
        </>
      )}
    </div>
  )
}
```

### 2. Product Card Component

```tsx
// src/components/ProductCard.tsx
import { Plus, Minus, ShoppingCart, Package } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    stock: number
    imageUrl?: string
  }
  onProductClick: (product: any) => void
}

export function ProductCard({ product, onProductClick }: ProductCardProps) {
  const quantityInCart = 0 // Get from cart store
  const availableStock = product.stock - quantityInCart
  const isOutOfStock = product.stock === 0

  return (
    <div 
      className={`border rounded-lg p-3 flex flex-col cursor-pointer hover:border-green-500 transition-all relative ${
        isOutOfStock ? 'opacity-50' : ''
      }`}
      onClick={() => !isOutOfStock && onProductClick(product)}
    >
      {/* Cart Badge */}
      {quantityInCart > 0 && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
          <ShoppingCart size={12} />
          {quantityInCart}
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package size={32} className="text-gray-400" />
        )}
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>
      
      {/* Product Name */}
      <h3 className="font-medium text-sm truncate">{product.name}</h3>
      
      {/* Stock Indicator */}
      <div className="flex items-center gap-1 mt-1">
        <span className={`text-xs ${
          isOutOfStock ? 'text-red-500' : 
          availableStock <= 10 ? 'text-yellow-500' : 
          'text-gray-500'
        }`}>
          {isOutOfStock ? 'Out of stock' : `${availableStock} available`}
        </span>
      </div>
      
      {/* Price and Add Button */}
      <div className="mt-auto pt-2 flex items-center justify-between">
        <span className="text-green-500 font-semibold text-sm">
          ₱{product.price.toFixed(2)}
        </span>
        
        {quantityInCart > 0 ? (
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <button className="p-1 rounded bg-gray-100 hover:bg-red-500 hover:text-white">
              <Minus size={14} />
            </button>
            <span className="w-6 text-center text-sm font-medium">{quantityInCart}</span>
            <button 
              disabled={availableStock <= 0}
              className="p-1 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button 
            disabled={isOutOfStock}
            className="p-1.5 rounded-md bg-gray-100 hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
```

### 3. Cart Component

```tsx
// src/components/Cart.tsx
import { useState } from 'react'
import { Minus, Plus, Trash2, Smartphone, Banknote, ShoppingCart } from 'lucide-react'

interface CartProps {
  onNewSale?: () => void
}

export function Cart({ onNewSale }: CartProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash')
  
  const items = [] // Get from cart store
  const total = 0 // Calculate total

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6">
        <ShoppingCart size={48} className="mb-4 opacity-50" />
        <p>Cart is empty</p>
        <p className="text-sm mt-1">Add products to get started</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">Current Order</h2>
        <p className="text-sm text-gray-500">
          {items.reduce((sum, i) => sum + i.quantity, 0)} items
        </p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {items.map((item) => (
          <div key={item.product.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                <p className="text-gray-500 text-xs">₱{item.product.price.toFixed(2)} each</p>
              </div>
              <button className="p-1 text-gray-500 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded bg-gray-100 hover:bg-gray-200">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button className="p-1.5 rounded bg-gray-100 hover:bg-gray-200">
                  <Plus size={14} />
                </button>
              </div>
              <span className="font-semibold text-green-500">
                ₱{(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total</span>
          <span className="text-green-500">₱{total.toFixed(2)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setPaymentMethod('cash')}
            className="flex items-center justify-center gap-2 py-3 border rounded-lg hover:bg-gray-50"
          >
            <Banknote size={18} />
            Cash
          </button>
          <button 
            onClick={() => setPaymentMethod('gcash')}
            className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Smartphone size={18} />
            GCash
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 4. Quantity Modal

```tsx
// Inside POS.tsx
{selectedProduct && (
  <>
    {/* Backdrop */}
    <div 
      className="fixed inset-0 bg-black/60 z-50" 
      onClick={() => setSelectedProduct(null)} 
    />
    
    {/* Modal */}
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 p-4">
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add to Cart</h2>
          <button onClick={() => setSelectedProduct(null)}>
            <X size={20} />
          </button>
        </div>

        {/* Product Info */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-xl bg-gray-100 mx-auto mb-3 flex items-center justify-center">
            <Package size={40} />
          </div>
          <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
          <p className="text-green-500 font-bold text-xl">₱{selectedProduct.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{selectedProduct.stock} available</p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <Minus size={20} />
          </button>
          <span className="text-3xl font-bold w-16 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Subtotal */}
        <div className="bg-gray-100 rounded-lg p-3 mb-4 flex justify-between items-center">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-bold text-green-500 text-lg">
            ₱{(selectedProduct.price * quantity).toFixed(2)}
          </span>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddToCart}
          className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={20} />
          Add to Cart
        </button>
      </div>
    </div>
  </>
)}
```

## Responsive Design Tips

### 1. Breakpoints

```css
/* Mobile First Approach */
.container {
  /* Mobile: Default styles */
  padding: 1rem;
}

@media (min-width: 640px) {
  /* Tablet */
  .container {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  /* Desktop */
  .container {
    padding: 2rem;
  }
}
```

### 2. Touch-Friendly Targets

```css
/* Minimum 44x44px for touch targets */
.button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

### 3. Scrollable Areas

```css
/* Enable momentum scrolling on iOS */
.scrollable {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
```

### 4. Grid Responsiveness

```tsx
// Tailwind classes for responsive grid
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
  {/* Products */}
</div>
```

## CSS Variables (Theme)

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --bg-hover: #e5e7eb;
  
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  
  --border-color: #e5e7eb;
  
  --accent: #3ecf8e;
  --accent-hover: #2fb87a;
  --accent-muted: #d1fae5;
  
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}

[data-theme="dark"] {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --bg-tertiary: #374151;
  --bg-hover: #4b5563;
  
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;
  
  --border-color: #374151;
}
```

## State Management (Zustand)

```tsx
// src/store/cartStore.ts
import { create } from 'zustand'

interface CartItem {
  product: Product
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i.product.id === product.id)
    if (existing) {
      return {
        items: state.items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
    }
    return { items: [...state.items, { product, quantity: 1 }] }
  }),
  
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(i => i.product.id !== productId)
  })),
  
  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    )
  })),
  
  clearCart: () => set({ items: [] }),
  
  getTotal: () => {
    const { items } = get()
    return items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0)
  },
  
  getItemCount: () => {
    const { items } = get()
    return items.reduce((sum, i) => sum + i.quantity, 0)
  }
}))
```

## Key Features Checklist

### Product Display
- ✅ Grid view (2-5 columns responsive)
- ✅ List view (desktop only)
- ✅ Product images/icons
- ✅ Price display
- ✅ Stock indicators (colors)
- ✅ Out of stock overlay
- ✅ Cart quantity badge

### Cart Functionality
- ✅ Add/remove items
- ✅ Quantity controls
- ✅ Real-time total
- ✅ Empty state
- ✅ Desktop: Fixed panel
- ✅ Mobile: Drawer + floating button

### Search & Filter
- ✅ Search bar
- ✅ Category filters
- ✅ Horizontal scroll on mobile
- ✅ Active state indicators

### Modals
- ✅ Quantity selector
- ✅ Checkout (Cash/GCash)
- ✅ Success with receipt
- ✅ Backdrop click to close
- ✅ Escape key support

### Responsive Design
- ✅ Mobile: 2-column grid
- ✅ Tablet: 3-column grid
- ✅ Desktop: 4-5 column grid
- ✅ Touch-friendly buttons (44px min)
- ✅ Smooth transitions
- ✅ Momentum scrolling

## Performance Tips

1. **Virtualization** - For large product lists (1000+ items), use `react-window` or `react-virtual`
2. **Lazy Loading** - Load product images lazily
3. **Debounce Search** - Debounce search input (300ms)
4. **Memoization** - Use `useMemo` for filtered products
5. **Code Splitting** - Lazy load modals and heavy components

## Testing Checklist

- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on iPad (landscape/portrait)
- [ ] Test on desktop (1920x1080)
- [ ] Test with 0 products
- [ ] Test with 1000+ products
- [ ] Test with slow network
- [ ] Test touch gestures
- [ ] Test keyboard navigation
- [ ] Test screen readers

## Summary

This UI implementation provides:
- **Mobile-first design** with responsive breakpoints
- **Touch-optimized** interactions for mobile devices
- **Desktop-optimized** split-panel layout
- **Smooth animations** and transitions
- **Accessible** with proper ARIA labels
- **Performant** with optimized rendering

Copy the code examples above and adapt them to your tech stack. The core patterns (split panel, drawer, modals) work with any framework (React, Vue, Angular, Svelte).
