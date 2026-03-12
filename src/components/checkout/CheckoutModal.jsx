import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { formatPrice, buildWhatsAppMessage } from '@/lib/utils'
import { customerApi } from '@/lib/api'

const EMPTY_FORM = { name: '', phone: '', address: '', city: '', province: '', landmark: '', preferredDate: '', notes: '' }

const Field = ({ label, name, required, type = 'text', placeholder, half, value, error, onChange }) => (
  <div className={half ? 'flex-[1_1_45%] min-w-[140px]' : 'w-full'}>
    <label className={`label-field ${error ? '!text-red-500' : ''}`}>
      {label}{required && ' *'}
    </label>
    {type === 'textarea' ? (
      <textarea
        value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`input-field resize-y ${error ? '!border-red-400' : ''}`}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`input-field ${error ? '!border-red-400' : ''}`}
      />
    )}
    {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
  </div>
)

export default function CheckoutModal({ cart, onClose, onSuccess, config }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [savedCustomer, setSavedCustomer] = useState(null)
  const [loading, setLoading] = useState(false)

  // Try loading saved customer from API
  useEffect(() => {
    // We'll skip auto-load since we don't have the phone yet.
    // Customer data loads when they type their phone number.
  }, [])

  const lookupCustomer = async (phone) => {
    if (phone.length < 7) return
    try {
      const data = await customerApi.getByPhone(phone)
      if (data && data.name) {
        setSavedCustomer(data)
        setForm(prev => ({ ...prev, name: data.name, address: data.address || '', city: data.city || '', province: data.province || '', landmark: data.landmark || '' }))
      }
    } catch (e) { /* not found */ }
  }

  const clearSaved = () => {
    setSavedCustomer(null)
    setForm(EMPTY_FORM)
  }

  const setField = (name, value) => {
    setForm(p => ({ ...p, [name]: value }))
    setErrors(p => ({ ...p, [name]: undefined }))
    if (name === 'phone' && value.replace(/\D/g, '').length >= 7) {
      lookupCustomer(value.replace(/\D/g, ''))
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'ຈຳເປັນ'
    if (!form.phone.trim()) e.phone = 'ຈຳເປັນ'
    else if (!/^[\d\s\-+()]{7,}$/.test(form.phone)) e.phone = 'ເບີບໍ່ຖືກຕ້ອງ'
    if (!form.address.trim()) e.address = 'ຈຳເປັນ'
    if (!form.city.trim()) e.city = 'ຈຳເປັນ'
    if (!form.province.trim()) e.province = 'ຈຳເປັນ'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setSending(true)

    // Save customer data
    try {
      await customerApi.save({
        name: form.name, phone: form.phone, address: form.address,
        city: form.city, province: form.province, landmark: form.landmark,
      })
    } catch (e) { /* ok */ }

    // Open WhatsApp
    const msg = buildWhatsAppMessage(cart, form, config)
    window.open(`https://wa.me/${config.whatsappNumber}?text=${msg}`, '_blank')
    setTimeout(() => { setSending(false); onSuccess() }, 500)
  }

  const subtotal = cart.reduce((s, i) => s + (i.salePrice || i.price) * i.quantity, 0)
  const deliveryFee = subtotal >= config.freeDeliveryMin ? 0 : config.deliveryFee

  return (
    <div className="fixed inset-0 z-[1003] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-[560px] overflow-auto rounded-2xl bg-white" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
          <X size={16} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-semibold">ສັ່ງຊື້</h2>
          <p className="mt-1 text-sm text-gray-400">ກະລຸນາຕື່ມຂໍ້ມູນ — ພວກເຮົາຈະສົ່ງອໍເດີຜ່ານ WhatsApp</p>

          {/* Welcome back */}
          {savedCustomer && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                  {savedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">ຍິນດີຕ້ອນຮັບກັບຄືນ, {savedCustomer.name.split(' ')[0]}!</p>
                  <p className="text-[11px] text-green-500">ຂໍ້ມູນຂອງທ່ານຖືກຕື່ມໃຫ້ແລ້ວ</p>
                </div>
              </div>
              <button onClick={clearSaved} className="text-[11px] text-gray-500 underline">ໃຊ້ຂໍ້ມູນອື່ນ</button>
            </div>
          )}

          {/* Order Summary */}
          <div className="mt-6 rounded-xl bg-brand-50 p-5">
            <p className="mb-3 text-[11px] font-bold tracking-wider text-gray-400">ສະຫຼຸບອໍເດີ</p>
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between py-1.5 text-sm">
                <span className="text-gray-600">
                  {item.quantity}× {item.name} <span className="text-gray-400">({item.selectedSize}, {item.selectedColor})</span>
                </span>
                <span className="font-semibold">{formatPrice((item.salePrice || item.price) * item.quantity, config.currency)}</span>
              </div>
            ))}
            <div className="mt-2.5 border-t border-brand-200 pt-2.5">
              <div className="flex justify-between text-xs text-gray-400">
                <span>ຄ່າຈັດສົ່ງ</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'ຟຣີ' : formatPrice(deliveryFee, config.currency)}
                </span>
              </div>
              <div className="mt-1.5 flex justify-between text-base font-bold">
                <span>ລວມທັງໝົດ</span>
                <span>{formatPrice(subtotal + deliveryFee, config.currency)}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="mt-7 flex flex-wrap gap-4">
            <Field label="ຊື່ ແລະ ນາມສະກຸນ" name="name" required placeholder="ຊື່ເຕັມຂອງທ່ານ" value={form.name} error={errors.name} onChange={setField} />
            <Field label="ເບີໂທລະສັບ" name="phone" required placeholder="020 1234 5678" type="tel" value={form.phone} error={errors.phone} onChange={setField} />
            <Field label="ທີ່ຢູ່ຈັດສົ່ງ" name="address" required placeholder="ເລກທີ່ບ້ານ, ຖະໜົນ" value={form.address} error={errors.address} onChange={setField} />
            <Field label="ເມືອງ / ນະຄອນ" name="city" required placeholder="ເມືອງ" half value={form.city} error={errors.city} onChange={setField} />
            <Field label="ແຂວງ" name="province" required placeholder="ແຂວງ" half value={form.province} error={errors.province} onChange={setField} />
            <Field label="ຈຸດສັງເກດ" name="landmark" placeholder="ໃກ້ວັດ, ຕະຫຼາດ..." half value={form.landmark} error={errors.landmark} onChange={setField} />
            <Field label="ວັນທີ່ຕ້ອງການຮັບ" name="preferredDate" type="date" value={form.preferredDate} error={errors.preferredDate} onChange={setField} />
            <Field label="ໝາຍເຫດ" name="notes" type="textarea" placeholder="ຄຳຮ້ອງຂໍພິເສດ..." value={form.notes} error={errors.notes} onChange={setField} />
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={submit}
            disabled={sending}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {sending ? 'ກຳລັງເປີດ WhatsApp...' : 'ສົ່ງອໍເດີຜ່ານ WhatsApp'}
          </button>
          <p className="mt-2.5 text-center text-[11px] text-gray-400">
            ອໍເດີຂອງທ່ານຈະຖືກສົ່ງໄປ WhatsApp ເພື່ອຢືນຢັນ
          </p>
        </div>
      </div>
    </div>
  )
}
