import { useState, useRef, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { BADGE_COLORS } from '@/data/constants'

export default function ProductCard({ product, onView, config }) {
  const [imgIdx, setImgIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const touchStartX = useRef(null)

  // Reset loaded state when image index changes
  useEffect(() => { setLoaded(false) }, [imgIdx])
  const price = product.salePrice || product.price
  const badgeCls = BADGE_COLORS[product.badge]
  const total = product.images.length

  const prev = (e) => { e.stopPropagation(); setImgIdx(i => (i - 1 + total) % total) }
  const next = (e) => { e.stopPropagation(); setImgIdx(i => (i + 1) % total) }

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? setImgIdx(i => (i + 1) % total) : setImgIdx(i => (i - 1 + total) % total)
    touchStartX.current = null
  }

  return (
    <div
      className="group cursor-pointer transition-transform duration-300 hover:-translate-y-1"
      onClick={() => onView(product)}
      onMouseEnter={() => total > 1 && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
    >
      {/* Image */}
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-brand-100"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Skeleton */}
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-brand-100 to-brand-200" />
        )}
        <img
          src={product.images[imgIdx]}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {product.badge && badgeCls && (
          <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wide ${badgeCls}`}>
            {product.badge}
          </span>
        )}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/50"
              aria-label="Previous"
            >‹</button>
            <button
              onClick={next}
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/50"
              aria-label="Next"
            >›</button>
            <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setImgIdx(i) }}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
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
