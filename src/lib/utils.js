export function formatPrice(amount, currency = '₭') {
  return `${Number(amount).toLocaleString()} ${currency}`
}

export function buildWhatsAppMessage(cart, customer, config, payment = null) {
  const lines = [
    `🛍️ *ອໍເດີໃໝ່ຈາກ ${config.name}*`,
    '━━━━━━━━━━━━━━',
    ...(payment?.orderNo ? [`ເລກອໍເດີ: ${payment.orderNo}`] : []),
    '',
    '👤 *ຂໍ້ມູນລູກຄ້າ*',
    `ຊື່: ${customer.name}`,
    `ເບີໂທ: ${customer.phone}`,
    `ແຂວງ: ${customer.province}`,
    `ເມືອງ: ${customer.city}`,
    `ບ້ານ: ${customer.village}`,
  ]

  if (customer.landmark) lines.push(`ຈຸດສັງເກດ: ${customer.landmark}`)
  if (customer.logistics) lines.push(`🚚 ຂົນສົ່ງ: ${customer.logistics}`)

  lines.push('', '📦 *ລາຍການສິນຄ້າ*')

  let subtotal = 0
  cart.forEach((item, i) => {
    const price = item.salePrice || item.price
    const lineTotal = price * item.quantity
    subtotal += lineTotal
    lines.push(
      `${i + 1}. ${item.name}`,
      `   ${item.selectedSize} | ${item.selectedColor}`,
      `   ${item.quantity}x ${formatPrice(price, config.currency)} = ${formatPrice(lineTotal, config.currency)}`
    )
  })

  const deliveryFee = subtotal >= config.freeDeliveryMin ? 0 : config.deliveryFee

  lines.push(
    '',
    '━━━━━━━━━━━━━━',
    `ລວມສິນຄ້າ: ${formatPrice(subtotal, config.currency)}`,
    `ຄ່າຈັດສົ່ງ: ${deliveryFee === 0 ? 'ຟຣີ ✨' : formatPrice(deliveryFee, config.currency)}`,
    `*ລວມທັງໝົດ: ${formatPrice(subtotal + deliveryFee, config.currency)}*`
  )

  if (payment?.paid) lines.push('✅ *ຈ່າຍແລ້ວຜ່ານ BCEL One*')

  if (customer.preferredDate) lines.push('', `📅 ວັນທີ່ຕ້ອງການຮັບ: ${customer.preferredDate}`)
  if (customer.notes) lines.push(`📝 ໝາຍເຫດ: ${customer.notes}`)
  lines.push('', 'ຂອບໃຈ! 🙏')

  return encodeURIComponent(lines.join('\n'))
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Supabase signed URLs (/object/sign/...?token=) expire. Once the bucket is
// public, the same file is reachable forever at /object/public/... — this
// returns that permanent URL, or null if `url` is not a signed Supabase URL.
export function publicImageUrl(url) {
  if (typeof url !== 'string' || !url.includes('/storage/v1/object/sign/')) return null
  return url.replace('/storage/v1/object/sign/', '/storage/v1/object/public/').split('?')[0]
}

export function productPath(product) {
  return `/product/${product.id}`
}
