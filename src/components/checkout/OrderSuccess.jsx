import { Check } from 'lucide-react'

export default function OrderSuccess({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div className="w-[90%] max-w-[400px] rounded-3xl bg-white p-12 text-center" onClick={e => e.stopPropagation()}>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white">
          <Check size={32} />
        </div>
        <h3 className="text-2xl font-semibold">ສົ່ງອໍເດີສຳເລັດ!</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          ພວກເຮົາຈະຢືນຢັນຜ່ານ WhatsApp ໄວໆນີ້.
        </p>
        <button onClick={onClose} className="btn-primary mx-auto mt-6 px-10">
          ຊື້ເຄື່ອງຕໍ່
        </button>
      </div>
    </div>
  )
}
