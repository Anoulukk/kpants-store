import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function CartDrawer({ open, onClose, cart, updateQuantity, removeItem, onCheckout, config }) {
  const subtotal = cart.reduce((s, i) => s + (i.salePrice || i.price) * i.quantity, 0)
  const deliveryFee = subtotal >= config.freeDeliveryMin ? 0 : config.deliveryFee
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0)

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-[1001] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 z-[1002] flex h-screen w-[min(400px,90vw)] flex-col bg-white shadow-2xl transition-all duration-300 ease-out ${
          open ? 'right-0' : '-right-[420px]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-xl font-semibold">ກະຕ່າ ({itemCount})</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="mt-4 text-base">ກະຕ່າຂອງທ່ານຫວ່າງ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3.5 border-b border-gray-50 pb-4 last:border-0">
                  <div className="h-[90px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl bg-brand-100">
                    <img src={item.images[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-brand-900">{item.name}</h4>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {item.selectedSize} · {item.selectedColor}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                        <button onClick={() => updateQuantity(idx, -1)} className="flex h-8 w-8 items-center justify-center hover:bg-gray-50">
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(idx, 1)} className="flex h-8 w-8 items-center justify-center hover:bg-gray-50">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">
                          {formatPrice((item.salePrice || item.price) * item.quantity, config.currency)}
                        </span>
                        <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 px-6 pb-6 pt-4">
            <div className="mb-4 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>ລວມສິນຄ້າ</span>
                <span>{formatPrice(subtotal, config.currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>ຄ່າຈັດສົ່ງ</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'ຟຣີ' : formatPrice(deliveryFee, config.currency)}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-center text-[11px] text-gray-400">
                  ສັ່ງເກີນ {formatPrice(config.freeDeliveryMin, config.currency)} ສົ່ງຟຣີ
                </p>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2.5 text-base font-bold">
                <span>ລວມທັງໝົດ</span>
                <span>{formatPrice(subtotal + deliveryFee, config.currency)}</span>
              </div>
            </div>
            <button onClick={onCheckout} className="btn-primary w-full py-4">
              ດຳເນີນການສັ່ງຊື້
            </button>
          </div>
        )}
      </div>
    </>
  )
}
