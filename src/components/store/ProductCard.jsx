import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { BADGE_COLORS } from '@/data/constants'

export default function ProductCard({ product, onView, config }) {
  const [imgIdx, setImgIdx] = useState(0)
  const price = product.salePrice || product.price
  const badgeCls = BADGE_COLORS[product.badge]

  return (
    <div
      className="cursor-pointer transition-transform duration-300 hover:-translate-y-1"
      onClick={() => onView(product)}
      onMouseEnter={() => product.images.length > 1 && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-brand-100">
        <img
          src={product.images[imgIdx]}
          alt={product.name}
          className="h-full w-full object-cover transition-opacity duration-300"
        />
        {product.badge && badgeCls && (
          <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wide ${badgeCls}`}>
            {product.badge}
          </span>
        )}
        {product.images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
            {product.images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === imgIdx ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-1 pt-3.5">
        <p className="text-[11px] tracking-wider text-gray-400">{product.category}</p>
        <h3 className="mt-1.5 text-[15px] font-medium leading-snug text-brand-900">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className={`text-sm font-semibold ${product.salePrice ? 'text-red-700' : 'text-brand-900'}`}>
            {formatPrice(price, config.currency)}
          </span>
          {product.salePrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.price, config.currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
