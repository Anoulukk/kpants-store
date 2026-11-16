import { useState, useEffect } from 'react'
import { publicImageUrl } from '@/lib/utils'

// <img> that falls back to the permanent public URL when a signed
// Supabase URL stops working (expired token).
export default function StoreImage({ src, alt = '', onError, ...rest }) {
  const [current, setCurrent] = useState(src)

  useEffect(() => { setCurrent(src) }, [src])

  const handleError = (e) => {
    const fallback = publicImageUrl(src)
    if (fallback && current !== fallback) setCurrent(fallback)
    else onError?.(e)
  }

  return <img src={current} alt={alt} loading="lazy" decoding="async" onError={handleError} {...rest} />
}
