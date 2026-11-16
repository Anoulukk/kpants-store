import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useMatch } from 'react-router-dom'
import { useStoreData } from '@/hooks/useStoreData'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/hooks/useToast'
import { formatPrice, productPath } from '@/lib/utils'
import { QR_PAYMENT_ENABLED, loadPendingPayment } from '@/lib/payment'

import Header from '@/components/store/Header'
import ProductCard from '@/components/store/ProductCard'
import ProductDetail from '@/components/store/ProductDetail'
import CartDrawer from '@/components/store/CartDrawer'
import CheckoutModal from '@/components/checkout/CheckoutModal'
import OrderSuccess from '@/components/checkout/OrderSuccess'
import AdminPanel from '@/components/admin/AdminPanel'
import Toast from '@/components/ui/Toast'

function StoreSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6" aria-busy="true" aria-label="ກຳລັງໂຫຼດ">
      <div className="mx-auto h-10 w-2/3 max-w-md animate-pulse rounded-lg bg-brand-200" />
      <div className="mx-auto mt-4 h-4 w-1/2 max-w-xs animate-pulse rounded bg-brand-100" />
      <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] sm:gap-7">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] animate-pulse rounded-xl bg-brand-100 sm:rounded-2xl" />
            <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-brand-100" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-brand-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

function StorePage({ storeData }) {
  const navigate = useNavigate()
  const { config, products, categories, loading } = storeData
  const { cart, cartOpen, setCartOpen, addToCart, updateQuantity, removeItem, clearCart, cartCount } = useCart()
  const { toast, showToast } = useToast()

  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  // Reopen checkout if a QR payment was in progress when the tab reloaded
  const [checkoutOpen, setCheckoutOpen] = useState(() => QR_PAYMENT_ENABLED && !!loadPendingPayment())
  const [orderOk, setOrderOk] = useState(false)

  // The open product lives in the URL (/product/:id) so it can be shared
  const productMatch = useMatch('/product/:id')
  const selId = productMatch?.params.id
  const selProduct = selId ? products.find(p => String(p.id) === selId) : null

  useEffect(() => {
    if (loading) return
    document.title = selProduct ? `${selProduct.name} — ${config.name}` : `${config.name} — ຮ້ານແຟຊັ່ນ`
  }, [loading, selProduct, config.name])

  // Unknown or deleted product link → back to the shop
  useEffect(() => {
    if (!loading && selId && !selProduct) navigate('/', { replace: true })
  }, [loading, selId, selProduct, navigate])

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
        config={config} loading={loading} cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        search={search} setSearch={setSearch}
      />

      {loading ? <StoreSkeleton /> : <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-5 text-center">
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
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-base">ບໍ່ພົບສິນຄ້າ</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] sm:gap-7">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onView={prod => navigate(productPath(prod))} config={config} />
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
        <p className="mt-3 text-xs text-gray-300">
          © {new Date().getFullYear()} {config.name} · <Link to="/admin" className="hover:text-gray-500">Admin</Link>
        </p>
      </footer>
      </>}

      {selProduct && (
        <ProductDetail
          key={selProduct.id}
          product={selProduct}
          onClose={() => navigate('/')}
          onAdd={handleAddToCart}
          onShared={() => showToast('ສຳເນົາລິ້ງແລ້ວ')}
          config={config}
        />
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
          onPaid={clearCart}
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
      <Route path="/" element={<StorePage storeData={storeData} />}>
        <Route path="product/:id" element={null} />
      </Route>
      <Route path="/admin" element={<AdminPanel storeData={storeData} />} />
    </Routes>
  )
}
