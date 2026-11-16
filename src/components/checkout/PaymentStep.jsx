import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Check, Download, Loader2, Smartphone } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { getPaymentStatus } from '@/lib/payment'
import WhatsAppIcon from '@/components/ui/WhatsAppIcon'

const POLL_MS = 4000

// Shows the BCEL One QR and waits until the server confirms the payment.
export default function PaymentStep({ payment, config, onPaid, onSendWhatsApp, onBack }) {
  const [status, setStatus] = useState('pending') // pending | paid | expired
  const [qrUrl, setQrUrl] = useState('')
  const [checkFailed, setCheckFailed] = useState(false)
  const onPaidRef = useRef(onPaid)
  onPaidRef.current = onPaid

  useEffect(() => {
    QRCode.toDataURL(payment.qrCode, { width: 520, margin: 2, errorCorrectionLevel: 'M' })
      .then(setQrUrl)
      .catch(() => setQrUrl(''))
  }, [payment.qrCode])

  useEffect(() => {
    if (status !== 'pending') return
    let stopped = false
    let timer

    const check = async () => {
      try {
        const res = await getPaymentStatus(payment.orderId)
        if (stopped) return
        setCheckFailed(false)
        if (res.status === 'paid') { setStatus('paid'); onPaidRef.current?.(); return }
        if (res.status === 'expired') { setStatus('expired'); return }
      } catch {
        if (!stopped) setCheckFailed(true)
      }
      if (!stopped) timer = setTimeout(check, POLL_MS)
    }

    // Check straight away when the customer comes back from the bank app
    const onVisible = () => {
      if (document.visibilityState === 'visible') { clearTimeout(timer); check() }
    }

    timer = setTimeout(check, POLL_MS)
    document.addEventListener('visibilitychange', onVisible)
    return () => { stopped = true; clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible) }
  }, [status, payment.orderId])

  if (status === 'paid') {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
          <Check size={32} />
        </div>
        <h2 className="text-2xl font-semibold">ຈ່າຍເງິນສຳເລັດ</h2>
        <p className="mt-2 text-sm text-gray-500">
          ໄດ້ຮັບ {formatPrice(payment.total, config.currency)} ແລ້ວ · ອໍເດີ {payment.orderNo}
        </p>
        <button
          onClick={onSendWhatsApp}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
        >
          <WhatsAppIcon /> ສົ່ງອໍເດີຜ່ານ WhatsApp
        </button>
        <p className="mt-2.5 text-[11px] text-gray-400">ກົດເພື່ອແຈ້ງຮ້ານ ແລະ ຢືນຢັນການຈັດສົ່ງ</p>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold">QR ໝົດອາຍຸແລ້ວ</h2>
        <p className="mt-2 text-sm text-gray-500">ຍັງບໍ່ໄດ້ຕັດເງິນ. ກະລຸນາສ້າງ QR ໃໝ່ເພື່ອຈ່າຍ.</p>
        <button onClick={onBack} className="btn-primary mx-auto mt-6 px-10">ກັບຄືນ</button>
      </div>
    )
  }

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-semibold">ສະແກນຈ່າຍດ້ວຍ BCEL One</h2>
      <p className="mt-1 text-sm text-gray-400">ອໍເດີ {payment.orderNo}</p>

      <div className="mx-auto mt-5 flex aspect-square w-full max-w-[260px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-2">
        {qrUrl
          ? <img src={qrUrl} alt="QR ຈ່າຍເງິນ BCEL One" className="h-full w-full" />
          : <Loader2 className="animate-spin text-gray-300" size={28} />}
      </div>

      <p className="mt-4 text-3xl font-bold text-brand-900">{formatPrice(payment.total, config.currency)}</p>

      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500" role="status">
        <Loader2 className="animate-spin" size={14} />
        {checkFailed ? 'ກຳລັງເຊື່ອມຕໍ່ຄືນ...' : 'ກຳລັງລໍຖ້າການຈ່າຍເງິນ...'}
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {payment.link && (
          <a href={payment.link} className="btn-primary w-full py-3.5 sm:hidden">
            <Smartphone size={18} /> ເປີດແອັບ BCEL One
          </a>
        )}
        {qrUrl && (
          <a
            href={qrUrl}
            download={`${payment.orderNo}-qr.png`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:border-gray-400"
          >
            <Download size={16} /> ບັນທຶກ QR
          </a>
        )}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-gray-400">
        QR ນີ້ໃຊ້ໄດ້ກັບແອັບ BCEL One ເທົ່ານັ້ນ. ຫຼັງຈ່າຍແລ້ວ ໜ້ານີ້ຈະປ່ຽນເອງ, ບໍ່ຕ້ອງສົ່ງສະລິບ.
      </p>
      <button onClick={onBack} className="mt-3 text-xs text-gray-500 underline">ຍົກເລີກ ແລະ ກັບໄປແກ້ໄຂອໍເດີ</button>
    </div>
  )
}
