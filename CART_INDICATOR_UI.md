# Cart Indicator Badge UI

This guide shows how to implement the cart indicator badge that appears on product cards when items are added to cart.

## Visual Design

Based on your POS terminal design:

```
┌─────────────────────────┐
│  ┌────┐                 │
│  │ 🛒 │ ← Badge         │
│  │ 1  │   (top-right)   │
│  └────┘                 │
│  ┌───────────────────┐  │
│  │                   │  │
│  │    📦 Package     │  │ ← Square image area
│  │      Icon         │  │   (light gray bg)
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  Danish                 │ ← Product name (bold)
│  39 available           │ ← Stock (gray text)
│                         │
│  ₱3.50        [-][1][+] │ ← Price (blue) + Controls
│                         │
└─────────────────────────┘

Without badge (not in cart):
┌─────────────────────────┐
│  ┌───────────────────┐  │
│  │                   │  │
│  │    📦 Package     │  │
│  │      Icon         │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  Espresso               │
│  100 available          │
│                         │
│  ₱3.50            [+]   │ ← Just add button
│                         │
└─────────────────────────┘
```

## Implementation

### 1. Product Card with Badge

```tsx
// ProductCard.tsx
import { ShoppingCart } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    stock: number
  }
  quantityInCart: number // Pass from cart store
}

export function ProductCard({ product, quantityInCart }: ProductCardProps) {
  return (
    <div className="relative border rounded-lg p-3 cursor-pointer hover:border-green-500">
      
      {/* Cart Indicator Badge - Only show if item is in cart */}
      {quantityInCart > 0 && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg">
          <ShoppingCart size={12} />
          {quantityInCart}
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      
      {/* Product Info */}
      <h3 className="font-medium text-sm truncate">{product.name}</h3>
      <p className="text-green-500 font-semibold">₱{product.price.toFixed(2)}</p>
    </div>
  )
}
```

### 2. Badge Styles (CSS)

```css
/* If using plain CSS */
.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #3ecf8e; /* Green */
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 9999px; /* Fully rounded */
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cart-badge-icon {
  width: 12px;
  height: 12px;
}
```

### 3. Tailwind CSS Version

```tsx
<div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg">
  <ShoppingCart size={12} />
  {quantityInCart}
</div>
```

### 4. With Animation (Optional)

```tsx
// Add animation when badge appears
{quantityInCart > 0 && (
  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg animate-bounce-in">
    <ShoppingCart size={12} />
    {quantityInCart}
  </div>
)}
```

```css
/* Animation CSS */
@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounce-in 0.3s ease-out;
}
```

## Badge Variations

### Variation 1: Simple Number Badge

```tsx
{quantityInCart > 0 && (
  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-lg">
    {quantityInCart}
  </div>
)}
```

### Variation 2: Badge with Icon Only (No Number)

```tsx
{quantityInCart > 0 && (
  <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1.5 rounded-full z-10 shadow-lg">
    <ShoppingCart size={14} />
  </div>
)}
```

### Variation 3: Badge with Pulse Animation

```tsx
{quantityInCart > 0 && (
  <div className="absolute -top-2 -right-2 z-10">
    {/* Pulse ring */}
    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
    
    {/* Badge */}
    <div className="relative bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
      <ShoppingCart size={12} />
      {quantityInCart}
    </div>
  </div>
)}
```

### Variation 4: Badge with Different Colors Based on Quantity

```tsx
{quantityInCart > 0 && (
  <div className={`absolute -top-2 -right-2 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg ${
    quantityInCart >= 10 ? 'bg-red-500' : 
    quantityInCart >= 5 ? 'bg-orange-500' : 
    'bg-green-500'
  }`}>
    <ShoppingCart size={12} />
    {quantityInCart}
  </div>
)}
```

## Integration with Cart Store

### Using Zustand

```tsx
// In ProductCard component
import { useCartStore } from '../store/cartStore'

export function ProductCard({ product }) {
  // Get quantity from cart store
  const items = useCartStore(state => state.items)
  const cartItem = items.find(item => item.product.id === product.id)
  const quantityInCart = cartItem?.quantity || 0

  return (
    <div className="relative border rounded-lg p-3">
      {/* Badge */}
      {quantityInCart > 0 && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg">
          <ShoppingCart size={12} />
          {quantityInCart}
        </div>
      )}
      
      {/* Rest of card */}
    </div>
  )
}
```

### Using React Context

```tsx
// In ProductCard component
import { useCart } from '../context/CartContext'

export function ProductCard({ product }) {
  const { getItemQuantity } = useCart()
  const quantityInCart = getItemQuantity(product.id)

  return (
    <div className="relative border rounded-lg p-3">
      {quantityInCart > 0 && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg">
          <ShoppingCart size={12} />
          {quantityInCart}
        </div>
      )}
    </div>
  )
}
```

## Complete Product Card Design

Based on your POS terminal UI, here's the complete card structure:

```tsx
import { ShoppingCart, Plus, Minus, Package } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  imageUrl?: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore()
  
  // Get quantity in cart
  const cartItem = items.find(item => item.product.id === product.id)
  const quantityInCart = cartItem?.quantity || 0
  const availableStock = product.stock - quantityInCart

  const handleAdd = () => {
    if (availableStock > 0) {
      addItem(product)
    }
  }

  const handleRemove = () => {
    if (quantityInCart > 1) {
      updateQuantity(product.id, quantityInCart - 1)
    } else {
      removeItem(product.id)
    }
  }

  const handleIncrement = () => {
    if (availableStock > 0) {
      updateQuantity(product.id, quantityInCart + 1)
    }
  }

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl p-4 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
      
      {/* ========== CART INDICATOR BADGE ========== */}
      {quantityInCart > 0 && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg">
          <ShoppingCart size={12} />
          {quantityInCart}
        </div>
      )}

      {/* ========== PRODUCT IMAGE ========== */}
      <div className="aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <Package size={48} className="text-gray-400" />
        )}
      </div>
      
      {/* ========== PRODUCT NAME ========== */}
      <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
        {product.name}
      </h3>
      
      {/* ========== STOCK INFO ========== */}
      <p className="text-sm text-gray-500 mb-3">
        {availableStock} available
      </p>
      
      {/* ========== PRICE AND CONTROLS ========== */}
      <div className="flex items-center justify-between">
        {/* Price */}
        <span className="text-blue-600 font-bold text-lg">
          ₱{product.price.toFixed(2)}
        </span>
        
        {/* Controls */}
        {quantityInCart > 0 ? (
          // Show [-] [quantity] [+] when in cart
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRemove}
              className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <Minus size={16} className="text-gray-700" />
            </button>
            
            <span className="w-8 text-center font-semibold text-gray-900">
              {quantityInCart}
            </span>
            
            <button 
              onClick={handleIncrement}
              disabled={availableStock <= 0}
              className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} className="text-white" />
            </button>
          </div>
        ) : (
          // Show just [+] button when not in cart
          <button 
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
```

## Card Styling Details

### 1. Card Container
```css
.product-card {
  position: relative;
  background: white;
  border: 1px solid #e5e7eb; /* gray-200 */
  border-radius: 16px; /* rounded-2xl */
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.product-card:hover {
  border-color: #60a5fa; /* blue-400 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 2. Cart Badge (Top-Right)
```css
.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #3b82f6; /* blue-500 */
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 3. Product Image Area
```css
.product-image {
  aspect-ratio: 1 / 1; /* Square */
  background: #f3f4f6; /* gray-100 */
  border-radius: 12px; /* rounded-xl */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}
```

### 4. Product Name
```css
.product-name {
  font-weight: 600; /* semibold */
  color: #111827; /* gray-900 */
  font-size: 16px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### 5. Stock Text
```css
.stock-text {
  font-size: 14px;
  color: #6b7280; /* gray-500 */
  margin-bottom: 12px;
}
```

### 6. Price
```css
.price {
  color: #2563eb; /* blue-600 */
  font-weight: bold;
  font-size: 18px;
}
```

### 7. Control Buttons
```css
/* Add button (when not in cart) */
.add-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e5e7eb; /* gray-200 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-button:hover {
  background: #3b82f6; /* blue-500 */
  color: white;
}

/* Minus button */
.minus-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e5e7eb; /* gray-200 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.minus-button:hover {
  background: #d1d5db; /* gray-300 */
}

/* Plus button (when in cart) */
.plus-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #3b82f6; /* blue-500 */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.plus-button:hover {
  background: #2563eb; /* blue-600 */
}

/* Quantity display */
.quantity-display {
  width: 32px;
  text-align: center;
  font-weight: 600;
  color: #111827; /* gray-900 */
}
```

## Tailwind CSS Classes Breakdown

```tsx
// Card container
className="relative bg-white border border-gray-200 rounded-2xl p-4 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"

// Cart badge
className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg"

// Image area
className="aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden"

// Product name
className="font-semibold text-gray-900 text-base mb-1 truncate"

// Stock text
className="text-sm text-gray-500 mb-3"

// Price
className="text-blue-600 font-bold text-lg"

// Minus button
className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"

// Quantity display
className="w-8 text-center font-semibold text-gray-900"

// Plus button (in cart)
className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors disabled:opacity-50"

// Add button (not in cart)
className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
```

## Grid Layout for Cards

```tsx
// 2 columns on mobile, 3 on tablet, 4 on desktop, 5 on large screens
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

```tsx
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  imageUrl?: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore()
  
  // Get quantity in cart
  const cartItem = items.find(item => item.product.id === product.id)
  const quantityInCart = cartItem?.quantity || 0
  const availableStock = product.stock - quantityInCart

  const handleAdd = () => {
    if (availableStock > 0) {
      addItem(product)
    }
  }

  const handleRemove = () => {
    if (quantityInCart > 1) {
      updateQuantity(product.id, quantityInCart - 1)
    } else {
      removeItem(product.id)
    }
  }

  return (
    <div className="relative border rounded-lg p-3 hover:border-green-500 transition-all">
      
      {/* CART INDICATOR BADGE */}
      {quantityInCart > 0 && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg animate-bounce-in">
          <ShoppingCart size={12} />
          {quantityInCart}
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-md" />
        ) : (
          <div className="text-gray-400 text-4xl">📦</div>
        )}
      </div>
      
      {/* Product Name */}
      <h3 className="font-medium text-sm truncate mb-1">{product.name}</h3>
      
      {/* Stock */}
      <p className="text-xs text-gray-500 mb-2">{availableStock} available</p>
      
      {/* Price and Controls */}
      <div className="flex items-center justify-between">
        <span className="text-green-500 font-semibold">₱{product.price.toFixed(2)}</span>
        
        {quantityInCart > 0 ? (
          <div className="flex items-center gap-1">
            <button 
              onClick={handleRemove}
              className="p-1 rounded bg-gray-100 hover:bg-red-500 hover:text-white transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center text-sm font-medium">{quantityInCart}</span>
            <button 
              onClick={handleAdd}
              disabled={availableStock <= 0}
              className="p-1 rounded bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={handleAdd}
            disabled={product.stock <= 0}
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

## Styling Tips

### 1. Position
- Use `absolute` positioning
- Place at `-top-2 -right-2` for slight overflow effect
- Use `z-10` or higher to ensure it's above other elements

### 2. Colors
- **Green** (#3ecf8e) - Default, positive action
- **Red** (#ef4444) - High quantity warning
- **Orange** (#f59e0b) - Medium quantity
- **Blue** (#3b82f6) - Alternative style

### 3. Size
- **Small**: `text-xs px-1.5 py-0.5` (for minimal look)
- **Medium**: `text-xs px-2 py-1` (recommended)
- **Large**: `text-sm px-3 py-1.5` (for emphasis)

### 4. Shadow
- Add `shadow-lg` for depth
- Use `shadow-xl` for more prominence
- Add `ring-2 ring-white` for outline effect

## Accessibility

```tsx
{quantityInCart > 0 && (
  <div 
    className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg"
    role="status"
    aria-label={`${quantityInCart} items in cart`}
  >
    <ShoppingCart size={12} aria-hidden="true" />
    <span>{quantityInCart}</span>
  </div>
)}
```

## Mobile Considerations

```css
/* Ensure badge is touch-friendly on mobile */
@media (max-width: 640px) {
  .cart-badge {
    /* Slightly larger on mobile for better visibility */
    font-size: 13px;
    padding: 5px 9px;
  }
}
```

## Summary

The cart indicator badge:
- ✅ Shows quantity of items in cart
- ✅ Positioned at top-right corner
- ✅ Green background with white text
- ✅ Includes shopping cart icon
- ✅ Only visible when quantity > 0
- ✅ Animated entrance (optional)
- ✅ Accessible with ARIA labels
- ✅ Responsive and touch-friendly

Copy the code above and customize colors, sizes, and animations to match your design!
