// Minimal Supabase (PostgREST) client for the serverless functions.
// Uses the service-role key, which must never be exposed to the browser.

const url = () => (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export function dbConfigured() {
  return Boolean(url() && key())
}

async function rest(path, { method = 'GET', body, prefer } = {}) {
  const res = await fetch(`${url()}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key(),
      Authorization: `Bearer ${key()}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Supabase ${method} ${path.split('?')[0]} failed (${res.status}): ${text.slice(0, 200)}`)
  return text ? JSON.parse(text) : null
}

export async function getProductsByIds(ids) {
  const list = [...new Set(ids)].map(Number).filter(Number.isFinite)
  if (!list.length) return []
  return rest(`products?select=id,name,price,sale_price,sizes,colors&id=in.(${list.join(',')})`)
}

export async function getStoreConfig() {
  const rows = await rest('config?select=key,value')
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

export async function insertOrder(order) {
  const rows = await rest('shop_orders', { method: 'POST', body: order, prefer: 'return=representation' })
  return rows[0]
}

export async function getOrder(id) {
  const rows = await rest(`shop_orders?select=*&id=eq.${encodeURIComponent(id)}&limit=1`)
  return rows[0] || null
}

export async function getOrderByTransaction(transactionId) {
  const rows = await rest(`shop_orders?select=*&transaction_id=eq.${encodeURIComponent(transactionId)}&limit=1`)
  return rows[0] || null
}

export async function updateOrder(id, patch) {
  const rows = await rest(`shop_orders?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH', body: patch, prefer: 'return=representation',
  })
  return rows[0] || null
}

// Marks an order paid only if it is still pending, so a webhook and a
// status poll arriving together cannot both "win".
export async function markOrderPaid(id, { paymentMethod, paymentRef }) {
  const rows = await rest(`shop_orders?id=eq.${encodeURIComponent(id)}&status=eq.pending`, {
    method: 'PATCH',
    body: {
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method: paymentMethod || null,
      payment_ref: paymentRef || null,
    },
    prefer: 'return=representation',
  })
  return rows[0] || null
}
