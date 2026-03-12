export function formatPrice(amount, currency = '₭') {
  return `${Number(amount).toLocaleString()} ${currency}`
}

export function buildWhatsAppMessage(cart, customer, config) {
  const lines = [
    `🛍️ *ອໍເດີໃໝ່ຈາກ ${config.name}*`,
    '━━━━━━━━━━━━━━',
    '',
    '👤 *ຂໍ້ມູນລູກຄ້າ*',
    `ຊື່: ${customer.name}`,
    `ເບີໂທ: ${customer.phone}`,
    `ທີ່ຢູ່: ${customer.address}`,
    `ເມືອງ: ${customer.city}`,
    `ແຂວງ: ${customer.province}`,
  ]

  if (customer.landmark) lines.push(`ຈຸດສັງເກດ: ${customer.landmark}`)

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

  if (customer.preferredDate) lines.push('', `📅 ວັນທີ່ຕ້ອງການຮັບ: ${customer.preferredDate}`)
  if (customer.notes) lines.push(`📝 ໝາຍເຫດ: ${customer.notes}`)
  lines.push('', 'ຂອບໃຈ! 🙏')

  return encodeURIComponent(lines.join('\n'))
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
