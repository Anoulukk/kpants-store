import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function ProductDetail({ product, onClose, onAdd, config }) {
  const [imgIdx, setImgIdx] = useState(0)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [size, setSize] = useState(null)

  useEffect(() => { setImgLoaded(false) }, [imgIdx])
  const [color, setColor] = useState(product.colors[0])
  const [sizeError, setSizeError] = useState(false)

  const handleAdd = () => {
    if (!size) { setSizeError(true); return }
    onAdd(product, size, color)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[860px] flex-wrap overflow-auto rounded-2xl bg-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white"
        >
          <X size={18} />
        </button>

        {/* Images */}
        <div className="relative min-h-[400px] flex-[1_1_380px] bg-brand-100">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-brand-100 to-brand-200" />
          )}
          <img
            src={product.images[imgIdx]}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ minHeight: 400 }}
          />
          {product.images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx(p => (p - 1 + product.images.length) % product.images.length)}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 hover:bg-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setImgIdx(p => (p + 1) % product.images.length)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 hover:bg-white"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {product.images.map((img, i) => (
              <div
                key={i}
                onClick={() => setImgIdx(i)}
                className={`h-12 w-12 cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                  i === imgIdx ? 'border-brand-900 opacity-100' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-[1_1_340px] flex-col gap-5 p-10">
          <div>
            <p className="text-[11px] tracking-widest text-gray-400">{product.category}</p>
            <h2 className="mt-2 font-display text-3xl text-brand-900">{product.name}</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-2xl font-semibold ${product.salePrice ? 'text-red-700' : 'text-brand-900'}`}>
              {formatPrice(product.salePrice || product.price, config.currency)}
            </span>
            {product.salePrice && (
              <span className="text-base text-gray-400 line-through">{formatPrice(product.price, config.currency)}</span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-gray-500">{product.description}</p>

          {/* Color */}
          <div>
            <p className="mb-2.5 text-xs font-semibold tracking-wider text-gray-500">ສີ — {color}</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                    color === c
                      ? 'border-2 border-brand-900 bg-brand-900 text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <p className={`mb-2.5 text-xs font-semibold tracking-wider ${sizeError ? 'text-red-500' : 'text-gray-500'}`}>
              ຂະໜາດ {sizeError ? '— ກະລຸນາເລືອກຂະໜາດ' : size ? `— ${size}` : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button
                  key={s}
                  onClick={() => { setSize(s); setSizeError(false) }}
                  className={`flex h-11 min-w-[44px] items-center justify-center rounded-xl px-3 text-sm font-medium transition-all ${
                    size === s
                      ? 'border-2 border-brand-900 bg-brand-900 text-white'
                      : sizeError
                        ? 'border border-red-400 bg-white text-gray-600'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <button onClick={handleAdd} className="btn-primary mt-2 py-4 text-base">
            <ShoppingBag size={18} />
            ເພີ່ມໃສ່ກະຕ່າ — {formatPrice(product.salePrice || product.price, config.currency)}
          </button>
        </div>
      </div>
    </div>
  )
}
