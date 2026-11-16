// QR payment (PhaJay / BCEL One). Off unless VITE_QR_PAYMENT=true, so the
// store keeps working as WhatsApp-only until the server keys are set.
export const QR_PAYMENT_ENABLED = import.meta.env.VITE_QR_PAYMENT === 'true'

const PENDING_KEY = 'kpants_pending_payment'

export async function createPayment(cart, customer) {
  const res = await fetch('/api/payments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer,
      items: cart.map(i => ({ id: i.id, size: i.selectedSize, color: i.selectedColor, quantity: i.quantity })),
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'payment_unavailable'), { code: data.error })
  return data
}

export async function getPaymentStatus(orderId) {
  const res = await fetch(`/api/payments/status?id=${encodeURIComponent(orderId)}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'status_unavailable')
  return data
}

// The customer may leave for the BCEL One app and come back to a reloaded
// tab, so the payment in progress is kept for this browser tab.
export function savePendingPayment(pending) {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending)) } catch { /* storage unavailable */ }
}

export function loadPendingPayment() {
  try {
    const p = JSON.parse(sessionStorage.getItem(PENDING_KEY))
    return p && p.payment?.orderId ? p : null
  } catch {
    return null
  }
}

export function clearPendingPayment() {
  try { sessionStorage.removeItem(PENDING_KEY) } catch { /* storage unavailable */ }
}
