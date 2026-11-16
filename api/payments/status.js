// GET /api/payments/status?id=<orderId>
// The browser polls this while the QR is on screen. If the webhook has not
// arrived yet, we ask PhaJay directly, so payment is confirmed either way.
import { json, UUID_RE } from '../_lib/http.js'
import { dbConfigured, getOrder, markOrderPaid, updateOrder } from '../_lib/db.js'
import { phajayConfigured, checkTransaction } from '../_lib/phajay.js'

export async function GET(request) {
  if (!dbConfigured() || !phajayConfigured()) return json({ error: 'payment_not_configured' }, 503)

  const id = new URL(request.url).searchParams.get('id') || ''
  if (!UUID_RE.test(id)) return json({ error: 'invalid_id' }, 400)

  try {
    let order = await getOrder(id)
    if (!order) return json({ error: 'not_found' }, 404)

    if (order.status === 'pending' && order.transaction_id) {
      const txn = await checkTransaction(order.transaction_id)
      if (txn.paid && txn.amount === order.total) {
        order = (await markOrderPaid(order.id, { paymentMethod: txn.paymentMethod })) || (await getOrder(id))
      } else if (txn.found && txn.status === 'EXPIRED') {
        order = (await updateOrder(order.id, { status: 'expired' })) || order
      }
    }

    return json({ status: order.status, orderNo: order.order_no, total: order.total })
  } catch (err) {
    console.error('[payments/status]', err.message)
    return json({ error: 'status_unavailable' }, 502)
  }
}
