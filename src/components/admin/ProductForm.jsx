import { useState } from 'react'

const Field = ({ label, value, onChange, type = 'text', placeholder, half, textarea, help }) => (
  <div className={half ? 'min-w-[200px] flex-[1_1_45%]' : 'w-full'}>
    <label className="label-admin">{label}</label>
    {textarea ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className="input-admin resize-y" />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input-admin" />
    )}
    {help && <p className="mt-1 text-[11px] italic text-admin-dim">{help}</p>}
  </div>
)

export default function ProductForm({ product, categories, onSave, onCancel, error }) {
  const isEdit = !!product
  const [f, setF] = useState(() => {
    if (product) return {
      ...product,
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      images: product.images.join('\n'),
      salePrice: product.salePrice || '',
    }
    return { name: '', price: '', salePrice: '', category: categories[0]?.id || '', sizes: 'S, M, L, XL', colors: 'ດຳ, ຂາວ', images: '', description: '', badge: '' }
  })

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const save = () => {
    if (!f.name || !f.price) return
    onSave({
      ...f,
      price: Number(f.price),
      salePrice: f.salePrice ? Number(f.salePrice) : null,
      sizes: f.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: f.colors.split(',').map(s => s.trim()).filter(Boolean),
      images: f.images.split('\n').map(s => s.trim()).filter(Boolean).length > 0
        ? f.images.split('\n').map(s => s.trim()).filter(Boolean)
        : [''],
    })
  }

  return (
    <div className="card-admin max-w-[680px]">
      <h3 className="mb-6 font-display text-2xl text-admin-text">
        {isEdit ? 'ແກ້ໄຂສິນຄ້າ' : 'ເພີ່ມສິນຄ້າໃໝ່'}
      </h3>

      <div className="flex flex-wrap gap-4">
        <Field label="ຊື່ສິນຄ້າ" value={f.name} onChange={v => set('name', v)} placeholder="ເຊັ່ນ: ເສື້ອຜ້າລິນິນ" />
        <Field label="ລາຄາ" value={f.price} onChange={v => set('price', v)} type="number" placeholder="89000" half />
        <Field label="ລາຄາຫຼຸດ (ບໍ່ບັງຄັບ)" value={f.salePrice} onChange={v => set('salePrice', v)} type="number" placeholder="ປ່ອຍຫວ່າງ" half />

        <div className="min-w-[200px] flex-[1_1_45%]">
          <label className="label-admin">ໝວດໝູ່</label>
          <select value={f.category} onChange={e => set('category', e.target.value)} className="input-admin">
            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        <div className="min-w-[200px] flex-[1_1_45%]">
          <label className="label-admin">ປ້າຍ</label>
          <select value={f.badge || ''} onChange={e => set('badge', e.target.value)} className="input-admin">
            <option value="">ບໍ່ມີປ້າຍ</option>
            <option value="ໃໝ່">ໃໝ່</option>
            <option value="ຂາຍດີ">ຂາຍດີ</option>
            <option value="ຫຼຸດລາຄາ">ຫຼຸດລາຄາ</option>
            <option value="ຈຳກັດ">ຈຳກັດ</option>
          </select>
        </div>

        <Field label="ຂະໜາດ (ຂັ້ນດ້ວຍ ,)" value={f.sizes} onChange={v => set('sizes', v)} placeholder="S, M, L, XL" help="ໃຊ້ 'ຟຣີໄຊ' ສຳລັບເຄື່ອງປະດັບ" />
        <Field label="ສີ (ຂັ້ນດ້ວຍ ,)" value={f.colors} onChange={v => set('colors', v)} placeholder="ດຳ, ຂາວ, ກົມທ່າ" />
        <Field label="ລິ້ງຮູບ (ແຕ່ລະແຖວ)" value={f.images} onChange={v => set('images', v)} textarea placeholder="https://..." help="ຮູບທຳອິດ = ຮູບຫຼັກ" />
        <Field label="ລາຍລະອຽດ" value={f.description} onChange={v => set('description', v)} textarea placeholder="ອະທິບາຍສິນຄ້າ..." />
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      <div className="mt-4 flex justify-end gap-3">
        <button onClick={onCancel} className="btn-ghost border-admin-border text-admin-dim">ຍົກເລີກ</button>
        <button onClick={save} className="btn-accent">{isEdit ? 'ບັນທຶກ' : 'ເພີ່ມສິນຄ້າ'}</button>
      </div>
    </div>
  )
}
