import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function AdminCategories({ categories, onAdd, onUpdate, onDelete }) {
  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editLabel, setEditLabel] = useState('')

  const add = () => {
    if (!newLabel.trim()) return
    const id = newLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0E80-\u0EFF-]/g, '') || `cat-${Date.now()}`
    onAdd({ id, label: newLabel.trim() })
    setNewLabel('')
  }

  const saveEdit = (id) => {
    onUpdate(id, editLabel)
    setEditingId(null)
  }

  return (
    <div>
      <h2 className="font-display text-3xl text-admin-text">ໝວດໝູ່</h2>
      <p className="mt-1 text-sm text-admin-dim">ຈັດລະບຽບສິນຄ້າເປັນໝວດໝູ່</p>

      {/* Add new */}
      <div className="card-admin mt-6 flex flex-wrap items-end gap-3 !p-5">
        <div className="flex-[1_1_240px]">
          <label className="label-admin">ໝວດໝູ່ໃໝ່</label>
          <input
            value={newLabel} onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="ເຊັ່ນ: ເກີບ" className="input-admin"
          />
        </div>
        <button onClick={add} className="btn-accent h-[46px]">
          <Plus size={14} /> ເພີ່ມ
        </button>
      </div>

      {/* List */}
      <div className="mt-4 space-y-1.5">
        {categories.map((cat, i) => (
          <div key={cat.id} className="card-admin flex items-center justify-between !rounded-xl !p-3.5">
            {editingId === cat.id ? (
              <div className="flex flex-1 items-center gap-2.5">
                <input
                  value={editLabel} onChange={e => setEditLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit(cat.id)}
                  autoFocus className="input-admin flex-1 !border-admin-accent"
                />
                <button onClick={() => saveEdit(cat.id)} className="rounded-lg bg-admin-accent px-4 py-2 text-xs font-semibold text-white">ບັນທຶກ</button>
                <button onClick={() => setEditingId(null)} className="rounded-lg border border-admin-border px-3 py-2 text-xs text-admin-dim">ຍົກເລີກ</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-admin-accent/10 text-xs font-bold text-admin-accent">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-admin-text">{cat.label}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setEditingId(cat.id); setEditLabel(cat.label) }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border text-admin-accent hover:bg-admin-accent/10">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => onDelete(cat.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border text-red-400 hover:bg-red-400/10">
                    <Trash2 size={13} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
