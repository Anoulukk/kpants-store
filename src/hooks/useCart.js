import { useState, useCallback } from 'react'

export function useCart() {
  const [cart, setCart] = useState([])
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
