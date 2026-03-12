import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

const AdminField = ({ label, value, onChange, type = 'text', placeholder, textarea, half, help }) => (
  <div className={half ? 'min-w-[200px] flex-[1_1_45%]' : 'w-full'}>
    <label className="label-admin">{label}</label>
    {textarea ? (
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className="input-admin resize-y" />
    ) : (
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input-admin" />
    )}
    {help && <p className="mt-1 text-[11px] italic text-admin-dim">{help}</p>}
  </div>
)

export default function AdminConfig({ config, onUpdate, onReset }) {
  const [resetConfirm, setResetConfirm] = useState(false)
  const set = (key, value) => onUpdate({ ...config, [key]: value })

  const sections = [
    { title: 'ທົ່ວໄປ', fields: [
      { label: 'ຊື່ຮ້ານ', key: 'name', half: true },
      { label: 'ຄຳຂວັນ', key: 'tagline', half: true },
      { label: 'ສັນຍາລັກເງິນ', key: 'currency', half: true, help: 'ເຊັ່ນ: ₭, $, ฿' },
      { label: 'ເບີ WhatsApp', key: 'whatsappNumber', half: true, help: 'ລະຫັດປະເທດ + ເບີ' },
    ]},
    { title: 'ໜ້າຫຼັກ', fields: [
      { label: 'ຫົວຂໍ້', key: 'heroTitle', half: true },
      { label: 'ຫົວຂໍ້ (ໂຕອຽງ)', key: 'heroTitleItalic', half: true },
      { label: 'ລາຍລະອຽດ', key: 'heroDescription', textarea: true },
    ]},
    { title: 'ການຈັດສົ່ງ', fields: [
      { label: 'ຄ່າຈັດສົ່ງ', key: 'deliveryFee', type: 'number', half: true },
      { label: 'ສັ່ງຂັ້ນຕ່ຳສົ່ງຟຣີ', key: 'freeDeliveryMin', type: 'number', half: true, help: 'ສັ່ງເກີນ = ສົ່ງຟຣີ' },
    ]},
    { title: 'ຄວາມປອດໄພ', fields: [
      { label: 'ລະຫັດຜ່ານແອັດມິນ', key: 'adminPassword', type: 'password', help: 'ໃຊ້ສຳລັບເຂົ້າໜ້ານີ້' },
    ]},
  ]

  return (
    <div>
      <h2 className="font-display text-3xl text-admin-text">ຕັ້ງຄ່າຮ້ານ</h2>
      <p className="mt-1 text-sm text-admin-dim">ກຳນົດລາຍລະອຽດຮ້ານຂອງທ່ານ</p>

      <div className="mt-7 space-y-5">
        {sections.map(section => (
          <div key={section.title} className="card-admin">
            <h3 className="mb-5 text-[13px] font-bold uppercase tracking-widest text-admin-accent">
              {section.title}
            </h3>
            <div className="flex flex-wrap gap-4">
              {section.fields.map(f => (
                <AdminField
                  key={f.key} label={f.label} value={config[f.key]}
                  onChange={v => set(f.key, f.type === 'number' ? Number(v) : v)}
                  type={f.type} placeholder={f.placeholder}
                  textarea={f.textarea} half={f.half} help={f.help}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-400/20 bg-admin-surface p-6">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-widest text-red-400">ໂຊນອັນຕະລາຍ</h3>
          <p className="mb-4 text-sm text-admin-dim">ລີເຊັດຂໍ້ມູນທັງໝົດກັບຄືນຄ່າເລີ່ມຕົ້ນ</p>

          {!resetConfirm ? (
            <button onClick={() => setResetConfirm(true)} className="rounded-xl border border-red-400/30 px-5 py-3 text-sm font-semibold text-red-400 hover:bg-red-400/10">
              ລີເຊັດກັບຄືນຄ່າເລີ່ມຕົ້ນ
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
                <AlertTriangle size={16} /> ແນ່ໃຈບໍ? ຂໍ້ມູນທັງໝົດຈະຖືກລຶບ!
              </div>
              <button onClick={() => { onReset(); setResetConfirm(false) }} className="btn-danger">ແມ່ນ, ລີເຊັດ</button>
              <button onClick={() => setResetConfirm(false)} className="btn-ghost border-admin-border text-admin-dim">ຍົກເລີກ</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
