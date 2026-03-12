import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useStoreData } from '@/hooks/useStoreData'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/hooks/useToast'
import { formatPrice } from '@/lib/utils'

import Header from '@/components/store/Header'
import ProductCard from '@/components/store/ProductCard'
import ProductDetail from '@/components/store/ProductDetail'
import CartDrawer from '@/components/store/CartDrawer'
import CheckoutModal from '@/components/checkout/CheckoutModal'
import OrderSuccess from '@/components/checkout/OrderSuccess'
import AdminPanel from '@/components/admin/AdminPanel'
import Toast from '@/components/ui/Toast'

function StorePage({ storeData }) {
  const navigate = useNavigate()
  const { config, products, categories } = storeData
  const { cart, cartOpen, setCartOpen, addToCart, updateQuantity, removeItem, clearCart, cartCount } = useCart()
  const { toast, showToast } = useToast()

  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const [selProduct, setSelProduct] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderOk, setOrderOk] = useState(false)

  const allCats = [{ id: 'all', label: 'ທັງໝົດ' }, ...categories]

  const filtered = products.filter(p =>
    (activeCat === 'all' || p.category === activeCat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAddToCart = (product, size, color) => {
    addToCart(product, size, color)
    showToast(`${product.name} ເພີ່ມໃສ່ກະຕ່າແລ້ວ`)
  }

  return (
    <div className="min-h-screen bg-brand-50 font-lao">
      <Header
        config={config} cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onAdminOpen={() => navigate('/admin')}
        search={search} setSearch={setSearch}
      />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-16 text-center">
        <p className="text-[11px] font-medium tracking-[4px] text-gray-400">{config.tagline}</p>
        <h2 className="mt-3 font-display text-[clamp(32px,6vw,56px)] leading-none text-brand-900">
          {config.heroTitle} <em className="italic">{config.heroTitleItalic}</em>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
          {config.heroDescription}
        </p>
      </section>

      {/* Categories */}
      <div className="mx-auto max-w-7xl px-6 pb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {allCats.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                activeCat === cat.id
                  ? 'border border-brand-900 bg-brand-900 text-white'
                  : 'border border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="mx-auto max-w-7xl px-6 pb-20">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-base">ບໍ່ພົບສິນຄ້າ</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-7">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onView={setSelProduct} config={config} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 px-6 py-10 text-center">
        <h3 className="font-display text-2xl text-brand-900">{config.name}</h3>
        <p className="mt-2 text-xs text-gray-400">
          ສັ່ງຊື້ຜ່ານ WhatsApp · ສົ່ງຟຣີເມື່ອສັ່ງເກີນ {formatPrice(config.freeDeliveryMin, config.currency)}
        </p>
        <p className="mt-3 text-xs text-gray-300">© 2026 {config.name}</p>
      </footer>

      {selProduct && (
        <ProductDetail product={selProduct} onClose={() => setSelProduct(null)} onAdd={handleAddToCart} config={config} />
      )}

      <CartDrawer
        open={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} updateQuantity={updateQuantity} removeItem={removeItem}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
        config={config}
      />

      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => { setCheckoutOpen(false); clearCart(); setOrderOk(true) }}
          config={config}
        />
      )}

      {orderOk && <OrderSuccess onClose={() => setOrderOk(false)} />}
      <Toast {...toast} />
    </div>
  )
}

export default function App() {
  const storeData = useStoreData()

  return (
    <Routes>
      <Route path="/" element={<StorePage storeData={storeData} />} />
      <Route path="/admin" element={<AdminPanel storeData={storeData} />} />
    </Routes>
  )
}
