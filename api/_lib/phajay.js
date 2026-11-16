// PhaJay Payment Gateway — https://payment-doc.phajay.co/v1
import crypto from 'node:crypto'

const base = () => (process.env.PHAJAY_BASE_URL || 'https://payment-gateway.phajay.co').replace(/\/$/, '')
const secret = () => process.env.PHAJAY_SECRET_KEY || ''
// PHAJAY_SANDBOX=true uses PhaJay's test endpoints (pay with the PhaJay sandbox app).
const sandbox = () => process.env.PHAJAY_SANDBOX === 'true'

export function phajayConfigured() {
  return Boolean(secret())
}

// Creates a BCEL One QR for `amount` kip.
// BCEL rejects Lao/Thai characters in `description`, so keep it ASCII.
export async function createBcelQr({ amount, description, orderNo, tag1 }) {
  const path = sandbox() ? '/v1/api/test/payment/generate-bcel-qr' : '/v1/api/payment/generate-bcel-qr'
  const res = await fetch(base() + path, {
    method: 'POST',
    headers: { secretKey: secret(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, description, orderNo, tag1 }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.qrCode || !data.transactionId) {
    throw new Error(`PhaJay QR request failed (${res.status}): ${String(data.message || '').slice(0, 120)}`)
  }
  return { transactionId: String(data.transactionId), qrCode: data.qrCode, link: data.link || null }
}

// Asks PhaJay directly whether a transaction has been paid.
export async function checkTransaction(transactionId) {
  const res = await fetch(`${base()}/v1/api/payment/check-transaction/status/${encodeURIComponent(transactionId)}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(secret()).toString('base64')}`,
    },
  })
  const body = await res.json().catch(() => ({}))
  const data = body.data
  if (!data) return { found: false, paid: false }
  return {
    found: true,
    paid: data.isPaid === true && data.status === 'PAYMENT_COMPLETED',
    status: data.status,
    amount: Number(data.amount),
    paymentMethod: data.paymentMethod || null,
  }
}

// Webhooks carry X-Signature = base64(HMAC-SHA256(raw body, key)).
// Before KYC approval PhaJay signs with the dev key, so accept either.
export function verifyWebhookSignature(rawBody, signature) {
  if (!signature) return false
  const keys = [process.env.PHAJAY_SECRET_KEY, process.env.PHAJAY_DEV_SECRET_KEY].filter(Boolean)
  const given = Buffer.from(String(signature))
  return keys.some(k => {
    const expected = Buffer.from(crypto.createHmac('sha256', k).update(rawBody).digest('base64'))
    return expected.length === given.length && crypto.timingSafeEqual(expected, given)
  })
}
