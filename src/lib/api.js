import { createClient } from '@supabase/supabase-js'
import { DEFAULT_CONFIG } from '@/data/constants'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

// ── Products ────────────────────────────────────────────
export const productApi = {
  getAll: async () => {
    const sb = requireSupabase()
    const { data, error } = await sb.from('products').select('*').order('id')
    if (error) throw error
    return data.map(p => ({
      ...p,
      salePrice: p.sale_price ?? null,
      sizes: p.sizes || [],
      colors: p.colors || [],
      images: p.images || [],
      description: p.description || '',
      badge: p.badge || '',
    }))
  },
  create: async (data) => {
    const sb = requireSupabase()
    const payload = {
      name: data.name,
      price: data.price,
      sale_price: data.salePrice || null,
      category: data.category,
      sizes: data.sizes || [],
      colors: data.colors || [],
      images: data.images || [],
      description: data.description || '',
      badge: data.badge || '',
    }
    const { data: rows, error } = await sb.from('products').insert(payload).select('*').limit(1)
    if (error) throw error
    const p = rows[0]
    return {
      ...p,
      salePrice: p.sale_price ?? null,
      sizes: p.sizes || [],
      colors: p.colors || [],
      images: p.images || [],
      description: p.description || '',
      badge: p.badge || '',
    }
  },
  update: async (id, data) => {
    const sb = requireSupabase()
    const payload = {
      name: data.name,
      price: data.price,
      sale_price: data.salePrice || null,
      category: data.category,
      sizes: data.sizes || [],
      colors: data.colors || [],
      images: data.images || [],
      description: data.description || '',
      badge: data.badge || '',
    }
    const { error } = await sb.from('products').update(payload).eq('id', id)
    if (error) throw error
    return { success: true }
  },
  delete: async (id) => {
    const sb = requireSupabase()
    const { error } = await sb.from('products').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  },
  replaceAll: async (products) => {
    const sb = requireSupabase()
    const { error: delError } = await sb.from('products').delete().neq('id', 0)
    if (delError) throw delError
    if (!products.length) return { success: true }
    const payload = products.map(p => ({
      name: p.name,
      price: p.price,
      sale_price: p.salePrice || null,
      category: p.category,
      sizes: p.sizes || [],
      colors: p.colors || [],
      images: p.images || [],
      description: p.description || '',
      badge: p.badge || '',
    }))
    const { error } = await sb.from('products').insert(payload)
    if (error) throw error
    return { success: true }
  },
}

// ── Categories ────────────────────────────────────────────
export const categoryApi = {
  getAll: async () => {
    const sb = requireSupabase()
    const { data, error } = await sb.from('categories').select('*').order('sort_order').order('id')
    if (error) throw error
    return data
  },
  create: async (data) => {
    const sb = requireSupabase()
    const { data: rows, error } = await sb.from('categories').insert({ id: data.id, label: data.label }).select('*').limit(1)
    if (error) throw error
    return rows[0]
  },
  update: async (id, data) => {
    const sb = requireSupabase()
    const { error } = await sb.from('categories').update({ label: data.label }).eq('id', id)
    if (error) throw error
    return { success: true }
  },
  delete: async (id) => {
    const sb = requireSupabase()
    const { error } = await sb.from('categories').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  },
  replaceAll: async (categories) => {
    const sb = requireSupabase()
    const { error: delError } = await sb.from('categories').delete().neq('id', '')
    if (delError) throw delError
    if (!categories.length) return { success: true }
    const payload = categories.map((c, i) => ({ id: c.id, label: c.label, sort_order: i }))
    const { error } = await sb.from('categories').insert(payload)
    if (error) throw error
    return { success: true }
  },
}

// ── Config ────────────────────────────────────────────────
export const configApi = {
  get: async () => {
    const sb = requireSupabase()
    const { data, error } = await sb.from('config').select('key,value')
    if (error) throw error
    const config = {}
    for (const row of data) {
      config[row.key] = isNaN(row.value) ? row.value : Number(row.value)
    }
    return config
  },
  update: async (data) => {
    const sb = requireSupabase()
    const rows = Object.entries(data).map(([key, value]) => ({ key, value: String(value) }))
    const { error } = await sb.from('config').upsert(rows, { onConflict: 'key' })
    if (error) throw error
    return { success: true }
  },
  reset: async () => {
    const sb = requireSupabase()
    const rows = Object.entries(DEFAULT_CONFIG).map(([key, value]) => ({ key, value: String(value) }))
    const { error: delError } = await sb.from('config').delete().neq('key', '')
    if (delError) throw delError
    const { error } = await sb.from('config').upsert(rows, { onConflict: 'key' })
    if (error) throw error
    return { success: true }
  },
}

// ── Customers ─────────────────────────────────────────────
export const customerApi = {
  getByPhone: async (phone) => {
    const sb = requireSupabase()
    const { data, error } = await sb.from('customers').select('*').eq('phone', phone).maybeSingle()
    if (error) throw error
    if (!data) return null
    return {
      name: data.name,
      phone: data.phone,
      village: data.village || '',
      city: data.city,
      province: data.province,
      landmark: data.landmark,
      logistics: data.logistics || '',
    }
  },
  save: async (data) => {
    const sb = requireSupabase()
    const payload = {
      name: data.name,
      phone: data.phone,
      village: data.village || '',
      city: data.city || '',
      province: data.province || '',
      landmark: data.landmark || '',
      logistics: data.logistics || '',
    }
    const { error } = await sb.from('customers').upsert(payload, { onConflict: 'phone' })
    if (error) throw error
    return { success: true }
  },
}

// ── Orders ────────────────────────────────────────────────
export const orderApi = {
  create: async (data) => {
    const sb = requireSupabase()
    const payload = {
      customer_id: data.customerId || null,
      items: data.items || [],
      subtotal: data.subtotal,
      delivery_fee: data.deliveryFee || 0,
      total: data.total,
      status: data.status || 'pending',
      notes: data.notes || '',
    }
    const { data: rows, error } = await sb.from('orders').insert(payload).select('id').limit(1)
    if (error) throw error
    return { id: rows[0].id }
  },
  getAll: async () => {
    const sb = requireSupabase()
    const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
}
