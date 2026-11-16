import { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, QrCode } from 'lucide-react'
import { getProvinces, getDistrictsByProvinceId, getVillagesByDistrictId } from '@anouluk/laos-address-typescript'
import { formatPrice, buildWhatsAppMessage } from '@/lib/utils'
import { customerApi } from '@/lib/api'
import { QR_PAYMENT_ENABLED, createPayment, savePendingPayment, loadPendingPayment, clearPendingPayment } from '@/lib/payment'
import WhatsAppIcon from '@/components/ui/WhatsAppIcon'
import PaymentStep from './PaymentStep'

const EMPTY_FORM = { name: '', phone: '', village: '', city: '', province: '', landmark: '', preferredDate: '', notes: '', logistics: '' }
const LOGISTICS_OPTIONS = ['ອານຸສິດ', 'ຮຸ່ງອາລຸນ']

const ALL_PROVINCES = getProvinces()

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

const SearchableSelect = ({ label, required, value, error, options, placeholder, onChange, disabled }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  const selected = options.find(o => o.value === value)
  const filtered = query ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase())) : options

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const pick = (opt) => { onChange(opt.value); setQuery(''); setOpen(false) }

  return (
    <div className="w-full" ref={ref}>
      <label className={`label-field ${error ? '!text-red-500' : ''}`}>
        {label}{required && ' *'}
      </label>
      <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`input-field flex w-full items-center justify-between text-left ${error ? '!border-red-400' : ''} ${!selected ? 'text-gray-400' : 'text-gray-900'}`}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronDown size={15} className={`ml-2 flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="ຄົ້ນຫາ..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-800"
              />
            </div>
            <ul className="max-h-48 overflow-y-auto pb-2">
              {filtered.length === 0 ? (
                <li className="px-4 py-2 text-sm text-gray-400">ບໍ່ພົບຂໍ້ມູນ</li>
              ) : filtered.map(opt => (
                <li
                  key={opt.value}
                  onClick={() => pick(opt)}
                  className={`cursor-pointer px-4 py-2 text-sm hover:bg-brand-50 ${opt.value === value ? 'font-semibold text-brand-800' : 'text-gray-700'}`}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

const PAY_ERRORS = {
  product_not_found: 'ມີສິນຄ້າໃນກະຕ່າທີ່ບໍ່ມີຂາຍແລ້ວ. ກະລຸນາກວດກະຕ່າຄືນ.',
  invalid_size: 'ຂະໜາດທີ່ເລືອກບໍ່ມີແລ້ວ. ກະລຸນາເລືອກໃໝ່.',
  invalid_color: 'ສີທີ່ເລືອກບໍ່ມີແລ້ວ. ກະລຸນາເລືອກໃໝ່.',
}
const PAY_ERROR_DEFAULT = 'ສ້າງ QR ບໍ່ໄດ້ໃນຕອນນີ້. ລອງໃໝ່ ຫຼື ສັ່ງຜ່ານ WhatsApp.'

export default function CheckoutModal({ cart, onClose, onSuccess, onPaid, config }) {
  // { payment, cart, form } while a QR payment is in progress
  const [pending, setPending] = useState(() => (QR_PAYMENT_ENABLED ? loadPendingPayment() : null))
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [savedCustomer, setSavedCustomer] = useState(null)
  const [provinceId, setProvinceId] = useState('')
  const [districtId, setDistrictId] = useState('')

  const districts = provinceId ? getDistrictsByProvinceId(provinceId) : []
  const villages = districtId ? getVillagesByDistrictId(districtId) : []

  const lookupCustomer = async (phone) => {
    if (phone.length < 7) return
    try {
      const data = await customerApi.getByPhone(phone)
      if (data && data.name) {
        setSavedCustomer(data)
        setForm(prev => ({
          ...prev,
          name: data.name,
          village: data.village || '',
          city: data.city || '',
          province: data.province || '',
          landmark: data.landmark || '',
          logistics: data.logistics || '',
        }))
        // Restore cascading IDs from saved names
        const prov = ALL_PROVINCES.find(p => p.pn === data.province)
        if (prov) {
          setProvinceId(prov.pid)
          const dists = getDistrictsByProvinceId(prov.pid)
          const dist = dists.find(d => d.dn === data.city)
          if (dist) setDistrictId(dist.did)
        }
      }
    } catch (e) { /* not found */ }
  }

  const clearSaved = () => {
    setSavedCustomer(null)
    setProvinceId('')
    setDistrictId('')
    setForm(EMPTY_FORM)
  }

  const setField = (name, value) => {
    setForm(p => ({ ...p, [name]: value }))
    setErrors(p => ({ ...p, [name]: undefined }))
    if (name === 'phone' && value.replace(/\D/g, '').length >= 7) {
      lookupCustomer(value.replace(/\D/g, ''))
    }
  }

  const handleProvinceChange = (pid) => {
    const prov = ALL_PROVINCES.find(p => p.pid === pid)
    setProvinceId(pid)
    setDistrictId('')
    setForm(p => ({ ...p, province: prov?.pn || '', city: '', village: '' }))
    setErrors(p => ({ ...p, province: undefined, city: undefined, village: undefined }))
  }

  const handleDistrictChange = (did) => {
    const dist = districts.find(d => d.did === did)
    setDistrictId(did)
    setForm(p => ({ ...p, city: dist?.dn || '', village: '' }))
    setErrors(p => ({ ...p, city: undefined, village: undefined }))
  }

  const handleVillageChange = (vid) => {
    const vil = villages.find(v => v.vid === vid)
    setForm(p => ({ ...p, village: vil?.vn || '' }))
    setErrors(p => ({ ...p, village: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'ຈຳເປັນ'
    if (!form.phone.trim()) e.phone = 'ຈຳເປັນ'
    else if (!/^[\d\s\-+()]{7,}$/.test(form.phone)) e.phone = 'ເບີບໍ່ຖືກຕ້ອງ'
    if (!form.province) e.province = 'ຈຳເປັນ'
    if (!form.city) e.city = 'ຈຳເປັນ'
    if (!form.village) e.village = 'ຈຳເປັນ'
    if (!form.logistics) e.logistics = 'ຈຳເປັນ'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const saveCustomer = async () => {
    try {
      await customerApi.save({
        name: form.name, phone: form.phone, village: form.village,
        city: form.city, province: form.province, landmark: form.landmark, logistics: form.logistics,
      })
    } catch (e) { /* ok */ }
  }

  const payWithQr = async () => {
    if (!validate()) return
    setPaying(true)
    setPayError('')
    try {
      await saveCustomer()
      const payment = await createPayment(cart, form)
      const next = { payment, cart, form }
      savePendingPayment(next)
      setPending(next)
    } catch (e) {
      setPayError(PAY_ERRORS[e.code] || PAY_ERROR_DEFAULT)
    } finally {
      setPaying(false)
    }
  }

  const leavePayment = () => { clearPendingPayment(); setPending(null) }

  const closeModal = () => { clearPendingPayment(); onClose() }

  const sendPaidOrder = () => {
    const msg = buildWhatsAppMessage(pending.cart, pending.form, config, { orderNo: pending.payment.orderNo, paid: true })
    window.open(`https://wa.me/${config.whatsappNumber}?text=${msg}`, '_blank')
    clearPendingPayment()
    onSuccess()
  }

  const submit = async () => {
    if (!validate()) return
    setSending(true)
    await saveCustomer()
    const msg = buildWhatsAppMessage(cart, form, config)
    window.open(`https://wa.me/${config.whatsappNumber}?text=${msg}`, '_blank')
    setTimeout(() => { setSending(false); onSuccess() }, 500)
  }

  const subtotal = cart.reduce((s, i) => s + (i.salePrice || i.price) * i.quantity, 0)
  const deliveryFee = subtotal >= config.freeDeliveryMin ? 0 : config.deliveryFee

  return (
    <div className="fixed inset-0 z-[1003] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-[560px] overflow-auto rounded-2xl bg-white" onClick={e => e.stopPropagation()}>
        <button onClick={closeModal} aria-label="ປິດ" className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
          <X size={16} />
        </button>

        {pending ? (
          <PaymentStep
            payment={pending.payment}
            config={config}
            onPaid={onPaid}
            onSendWhatsApp={sendPaidOrder}
            onBack={leavePayment}
          />
        ) : (
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

            {/* Province */}
            <SearchableSelect
              label="ແຂວງ" required
              value={provinceId}
              error={errors.province}
              placeholder="-- ເລືອກແຂວງ --"
              options={ALL_PROVINCES.map(p => ({ value: p.pid, label: p.pn }))}
              onChange={handleProvinceChange}
            />

            {/* District */}
            <SearchableSelect
              label="ເມືອງ" required
              value={districtId}
              error={errors.city}
              placeholder={provinceId ? '-- ເລືອກເມືອງ --' : '-- ເລືອກແຂວງກ່ອນ --'}
              options={districts.map(d => ({ value: d.did, label: d.dn }))}
              onChange={handleDistrictChange}
              disabled={!provinceId}
            />

            {/* Village */}
            <SearchableSelect
              label="ບ້ານ" required
              value={villages.find(v => v.vn === form.village)?.vid || ''}
              error={errors.village}
              placeholder={districtId ? '-- ເລືອກບ້ານ --' : '-- ເລືອກເມືອງກ່ອນ --'}
              options={villages.map(v => ({ value: v.vid, label: v.vn }))}
              onChange={handleVillageChange}
              disabled={!districtId}
            />

            <Field label="ຈຸດສັງເກດ" name="landmark" placeholder="ໃກ້ວັດ, ຕະຫຼາດ..." half value={form.landmark} error={errors.landmark} onChange={setField} />
            <Field label="ວັນທີ່ຕ້ອງການຮັບ" name="preferredDate" type="date" half value={form.preferredDate} error={errors.preferredDate} onChange={setField} />
            <Field label="ໝາຍເຫດ" name="notes" type="textarea" placeholder="ຄຳຮ້ອງຂໍພິເສດ..." value={form.notes} error={errors.notes} onChange={setField} />

            {/* Logistics */}
            <div className="w-full">
              <label className={`label-field ${errors.logistics ? '!text-red-500' : ''}`}>
                ບໍລິສັດຂົນສົ່ງ *
              </label>
              <div className="flex gap-3">
                {LOGISTICS_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setField('logistics', opt)}
                    className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-colors ${
                      form.logistics === opt
                        ? 'border-brand-800 bg-brand-50 text-brand-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    } ${errors.logistics ? '!border-red-300' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {errors.logistics && <p className="mt-1 text-[11px] text-red-500">{errors.logistics}</p>}
            </div>
          </div>

          {/* QR payment */}
          {QR_PAYMENT_ENABLED && (
            <>
              <button onClick={payWithQr} disabled={paying || sending} className="btn-primary mt-6 w-full py-4 text-base disabled:opacity-60">
                <QrCode size={20} />
                {paying ? 'ກຳລັງສ້າງ QR...' : `ຈ່າຍດ້ວຍ BCEL One — ${formatPrice(subtotal + deliveryFee, config.currency)}`}
              </button>
              {payError && <p className="mt-2 text-center text-xs text-red-500" role="alert">{payError}</p>}
              <p className="mt-4 text-center text-[11px] text-gray-400">ຫຼື ສັ່ງກ່ອນ ແລ້ວຈ່າຍພາຍຫຼັງ</p>
            </>
          )}

          {/* WhatsApp Button */}
          <button
            onClick={submit}
            disabled={sending || paying}
            className={`${QR_PAYMENT_ENABLED ? 'mt-2.5' : 'mt-6'} flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60`}
          >
            <WhatsAppIcon />
            {sending ? 'ກຳລັງເປີດ WhatsApp...' : 'ສົ່ງອໍເດີຜ່ານ WhatsApp'}
          </button>
          <p className="mt-2.5 text-center text-[11px] text-gray-400">
            ອໍເດີຂອງທ່ານຈະຖືກສົ່ງໄປ WhatsApp ເພື່ອຢືນຢັນ
          </p>
        </div>
        )}
      </div>
    </div>
  )
}
