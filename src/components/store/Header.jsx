import { useState, useRef, useEffect } from 'react'
import { Search, X, ShoppingBag, Shield } from 'lucide-react'

export default function Header({ config, cartCount, onCartOpen, onAdminOpen, search, setSearch }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-brand-50/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <h1 className="font-display text-2xl tracking-[3px] text-brand-900">{config.name}</h1>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearch('') }}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
              searchOpen ? 'bg-brand-900 text-white' : 'text-brand-900 hover:bg-gray-100'
            }`}
          >
            {searchOpen ? <X size={18} /> : <Search size={20} />}
          </button>

          <button
            onClick={onAdminOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-900 hover:bg-gray-100"
            aria-label="Open admin panel"
            title="Admin panel"
          >
            <Shield size={20} />
          </button>

          <button
            onClick={onCartOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-brand-900 hover:bg-gray-100"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brand-900 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="mx-auto max-w-7xl px-6 pb-4">
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ຄົ້ນຫາສິນຄ້າ..."
            className="input-field"
          />
        </div>
      )}
    </header>
  )
}
