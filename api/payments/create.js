// POST /api/payments/create
// Creates a pending order and a BCEL One QR for it.
// Prices are recalculated here from the database. Amounts sent by the
// browser are never trusted.
import crypto from 'node:crypto'
import { json } from '../_lib/http.js'
import { dbConfigured, getProductsByIds, getStoreConfig, insertOrder, updateOrder } from '../_lib/db.js'
import { phajayConfigured, createBcelQr } from '../_lib/phajay.js'

const REQUIRED = ['name', 'phone', 'province', 'city', 'village', 'logistics']
const OPTIONAL = ['landmark', 'preferredDate', 'notes']
const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max)

function newOrderNo() {
  const d = new Date()
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `KP${ymd}${rand}`
}

export async function POST(request) {
  if (!dbConfigured() || !phajayConfigured()) return json({ error: 'payment_not_configured' }, 503)

  let body
  try { body = await request.json() } catch { return json({ error: 'invalid_json' }, 400) }

  // Customer
  const customer = {}
  for (const f of REQUIRED) {
    customer[f] = clean(body?.customer?.[f])
    if (!customer[f]) return json({ error: 'missing_field', field: f }, 400)
  }
  for (const f of OPTIONAL) customer[f] = clean(body?.customer?.[f], 500)

  // Items
  const rawItems = Array.isArray(body?.items) ? body.items : []
  if (rawItems.length < 1 || rawItems.length > 30) return json({ error: 'invalid_items' }, 400)

  try {
    const products = await getProductsByIds(rawItems.map(i => i?.id))
    const byId = new Map(products.map(p => [String(p.id), p]))

    const items = []
    for (const raw of rawItems) {
      const product = byId.get(String(raw?.id))
      const quantity = Number(raw?.quantity)
      const size = clean(raw?.size, 40)
      const color = clean(raw?.color, 40)
      if (!product) return json({ error: 'product_not_found', id: raw?.id }, 409)
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) return json({ error: 'invalid_quantity' }, 400)
      const sizes = (product.sizes || []).map(s => String(s).trim())
      const colors = (product.colors || []).map(c => String(c).trim())
      if (sizes.length && !sizes.includes(size)) return json({ error: 'invalid_size', id: product.id }, 409)
      if (colors.length && !colors.includes(color)) return json({ error: 'invalid_color', id: product.id }, 409)
      const price = Number(product.sale_price) > 0 ? Number(product.sale_price) : Number(product.price)
      if (!Number.isFinite(price) || price <= 0) return json({ error: 'invalid_price', id: product.id }, 409)
      items.push({ id: product.id, name: product.name, size, color, quantity, price, lineTotal: price * quantity })
    }

    const config = await getStoreConfig()
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)
    const freeMin = Number(config.freeDeliveryMin ?? 200000)
    const fee = Number(config.deliveryFee ?? 15000)
    const deliveryFee = subtotal >= freeMin ? 0 : fee
    const total = subtotal + deliveryFee
    if (!Number.isFinite(total) || total <= 0) return json({ error: 'invalid_total' }, 409)

    const order = await insertOrder({
      order_no: newOrderNo(), status: 'pending', customer, items,
      subtotal, delivery_fee: deliveryFee, total,
    })

    const qr = await createBcelQr({
      amount: total,
      description: `Order ${order.order_no}`,
      orderNo: order.order_no,
      tag1: order.id,
    })
    await updateOrder(order.id, { transaction_id: qr.transactionId })

    return json({
      orderId: order.id, orderNo: order.order_no,
      subtotal, deliveryFee, total,
      qrCode: qr.qrCode, link: qr.link,
    })
  } catch (err) {
    console.error('[payments/create]', err.message)
    return json({ error: 'payment_unavailable' }, 502)
  }
}
