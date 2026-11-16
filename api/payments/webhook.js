// POST /api/payments/webhook
// Set this URL in the PhaJay portal: Settings > Webhook.
// PhaJay calls it after a successful payment.
import { json } from '../_lib/http.js'
import { dbConfigured, getOrderByTransaction, markOrderPaid } from '../_lib/db.js'
import { verifyWebhookSignature } from '../_lib/phajay.js'

export async function POST(request) {
  if (!dbConfigured()) return json({ error: 'payment_not_configured' }, 503)

  // The signature covers the exact bytes sent, so read the body before parsing.
  const raw = await request.text()
  if (!verifyWebhookSignature(raw, request.headers.get('x-signature'))) {
    return json({ message: 'Invalid signature' }, 401)
  }

  let event
  try { event = JSON.parse(raw) } catch { return json({ message: 'Invalid JSON' }, 400) }

  try {
    if (event.status && event.status !== 'PAYMENT_COMPLETED') return json({ message: 'IGNORED' })

    const order = event.transactionId ? await getOrderByTransaction(String(event.transactionId)) : null
    if (!order) return json({ message: 'UNKNOWN_TRANSACTION' })

    if (Number(event.txnAmount) !== order.total) {
      console.error('[payments/webhook] amount mismatch for', order.order_no)
      return json({ message: 'AMOUNT_MISMATCH' })
    }

    await markOrderPaid(order.id, {
      paymentMethod: event.paymentMethod,
      paymentRef: event.refNo != null ? String(event.refNo) : null,
    })
    return json({ message: 'OK' })
  } catch (err) {
    console.error('[payments/webhook]', err.message)
    return json({ message: 'ERROR' }, 500) // PhaJay may retry
  }
}
