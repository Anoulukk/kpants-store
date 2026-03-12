import { useState } from 'react'
import { Plus, Pencil, Trash2, Copy } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import ProductForm from './ProductForm'

export default function AdminProducts({ products, categories, config, onAdd, onUpdate, onDelete, onDuplicate }) {
  const [editing, setEditing] = useState(null) // null | 'new' | product
  const [deleteId, setDeleteId] = useState(null)

  const handleSave = async (data) => {
    if (editing === 'new') await onAdd(data)
    else await onUpdate(editing.id, data)
    setEditing(null)
  }

  if (editing) {
    return (
      <ProductForm
        product={editing === 'new' ? null : editing}
        categories={categories}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl text-admin-text">ສິນຄ້າ</h2>
          <p className="mt-1 text-sm text-admin-dim">{products.length} ລາຍການ</p>
        </div>
        <button onClick={() => setEditing('new')} className="btn-accent">
          <Plus size={16} /> ເພີ່ມສິນຄ້າ
        </button>
      </div>

      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="card-admin flex flex-wrap items-center gap-4 !p-4">
            <div className="h-[70px] w-[56px] flex-shrink-0 overflow-hidden rounded-xl bg-admin-border">
              <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
            </div>

            <div className="min-w-[140px] flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-medium text-admin-text">{p.name}</h4>
                {p.badge && (
                  <span className="rounded-md bg-admin-accent/20 px-2 py-0.5 text-[9px] font-bold tracking-wide text-admin-accent">
                    {p.badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-admin-dim">
                {p.category} · {formatPrice(p.salePrice || p.price, config.currency)} · {p.sizes.length} ຂະໜາດ · {p.colors.length} ສີ
              </p>
            </div>

            <div className="flex flex-shrink-0 gap-1.5">
              <button onClick={() => onDuplicate(p)} title="ສຳເນົາ" className="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border text-admin-dim hover:text-admin-text">
                <Copy size={14} />
              </button>
              <button onClick={() => setEditing(p)} title="ແກ້ໄຂ" className="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border text-admin-accent hover:bg-admin-accent/10">
                <Pencil size={14} />
              </button>
              <button onClick={() => setDeleteId(p.id)} title="ລຶບ" className="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border text-red-400 hover:bg-red-400/10">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-5" onClick={() => setDeleteId(null)}>
          <div className="w-full max-w-[360px] rounded-2xl border border-admin-border bg-admin-surface p-7 text-center" onClick={e => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
              <Trash2 size={22} />
            </div>
            <h3 className="font-display text-lg text-admin-text">ລຶບສິນຄ້ານີ້?</h3>
            <p className="mt-2 text-sm text-admin-dim">ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost border-admin-border text-admin-dim">ຍົກເລີກ</button>
              <button onClick={() => { onDelete(deleteId); setDeleteId(null) }} className="btn-danger">ລຶບ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
