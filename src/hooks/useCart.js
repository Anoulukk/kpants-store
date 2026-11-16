import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'kpants_cart'

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved.filter(i => i && i.id != null && i.quantity > 0) : []
  } catch {
    return []
  }
}

export function useCart() {
  const [cart, setCart] = useState(loadCart)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)) } catch { /* storage unavailable */ }
  }, [cart])
  const [cartOpen, setCartOpen] = useState(false)

  const addToCart = useCallback((product, selectedSize, selectedColor) => {
    setCart(prev => {
      const idx = prev.findIndex(
        i => i.id === product.id && i.selectedSize === selectedSize && i.selectedColor === selectedColor
      )
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
        return next
      }
      return [...prev, { ...product, selectedSize, selectedColor, quantity: 1 }]
    })
  }, [])

  const updateQuantity = useCallback((idx, delta) => {
    setCart(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], quantity: next[idx].quantity + delta }
      if (next[idx].quantity <= 0) next.splice(idx, 1)
      return next
    })
  }, [])

  const removeItem = useCallback((idx) => {
    setCart(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0)

  return {
    cart, cartOpen, setCartOpen,
    addToCart, updateQuantity, removeItem, clearCart,
    cartCount, cartTotal,
  }
}
