import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Tag, Settings, Eye, LogOut, Lock, Menu } from 'lucide-react'
import AdminProducts from './AdminProducts'
import AdminCategories from './AdminCategories'
import AdminConfig from './AdminConfig'

const SESSION_KEY = 'admin_logged_in'

// ── Login Screen ──────────────────────────────────────────
function AdminLogin({ onLogin, config }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const submit = () => {
    if (pw === config.adminPassword) {
      sessionStorage.setItem(SESSION_KEY, '1')
      onLogin()
    } else {
      setError(true); setShake(true); setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg p-5 font-lao">
      <div className={`w-full max-w-[380px] rounded-3xl border border-admin-border bg-admin-surface p-12 text-center ${shake ? 'animate-shake' : ''}`}>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-admin-accent to-admin-accent-dim text-white">
          <Lock size={24} />
        </div>
        <h2 className="font-display text-2xl text-admin-text">ໜ້າຄວບຄຸມ</h2>
        <p className="mt-1.5 text-sm text-admin-dim">ຈັດການຮ້ານ {config.name}</p>

        <input
          type="password" value={pw}
          onChange={e => { setPw(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="ໃສ່ລະຫັດຜ່ານ"
          className={`input-admin mt-7 ${error ? '!border-red-500' : ''}`}
        />
        {error && <p className="mt-2 text-xs text-red-400">ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ</p>}

        <button onClick={submit} className="btn-accent mt-3 w-full">ເຂົ້າສູ່ລະບົບ</button>
      </div>
    </div>
  )
}

// ── Main Admin Panel ──────────────────────────────────────
export default function AdminPanel({ storeData }) {
  const routerNavigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(() => !!sessionStorage.getItem(SESSION_KEY))
  const [page, setPage] = useState('products')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { config, products, categories, updateConfig, resetAll, addProduct, updateProduct, deleteProduct, duplicateProduct, addCategory, updateCategory, deleteCategory } = storeData

  const handleLogin = () => setLoggedIn(true)

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setLoggedIn(false)
  }

  if (!loggedIn) return <AdminLogin onLogin={handleLogin} config={config} />

  const navItems = [
    { id: 'products', icon: Package, label: 'ສິນຄ້າ' },
    { id: 'categories', icon: Tag, label: 'ໝວດໝູ່' },
    { id: 'config', icon: Settings, label: 'ຕັ້ງຄ່າ' },
  ]

  const goPage = (id) => { setPage(id); setSidebarOpen(false) }

  const SidebarContent = () => (
    <>
      <div className="border-b border-admin-border px-5 py-5">
        <h2 className="font-display text-xl text-admin-text">{config.name}</h2>
        <p className="mt-0.5 text-[11px] tracking-wide text-admin-dim">ໜ້າຄວບຄຸມ</p>
      </div>

      <nav className="flex-1 space-y-1 p-3 pt-4">
        {navItems.map(item => {
          const Icon = item.icon
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => goPage(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition-colors ${
                active
                  ? 'bg-admin-accent/10 font-semibold text-admin-accent'
                  : 'text-admin-dim hover:bg-white/5 hover:text-admin-text'
              }`}
            >
              <Icon size={18} /> {item.label}
            </button>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-admin-border p-3">
        <button onClick={() => routerNavigate('/')} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm text-admin-dim hover:text-admin-text">
          <Eye size={16} /> ເບິ່ງໜ້າຮ້ານ
        </button>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm text-red-400 hover:text-red-300">
          <LogOut size={16} /> ອອກຈາກລະບົບ
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-admin-bg font-lao">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — hidden on mobile, slide in when open */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[220px] flex-shrink-0 flex-col border-r border-admin-border bg-admin-surface transition-transform duration-200 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-admin-border bg-admin-surface px-4 py-3 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border text-admin-dim">
            <Menu size={18} />
          </button>
          <span className="font-display text-lg text-admin-text">{config.name}</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          {page === 'products' && (
            <AdminProducts
              products={products} categories={categories} config={config}
              onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} onDuplicate={duplicateProduct}
            />
          )}
          {page === 'categories' && (
            <AdminCategories
              categories={categories}
              onAdd={addCategory} onUpdate={updateCategory} onDelete={deleteCategory}
            />
          )}
          {page === 'config' && (
            <AdminConfig config={config} onUpdate={updateConfig} onReset={resetAll} />
          )}
        </main>
      </div>
    </div>
  )
}
