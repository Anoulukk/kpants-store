import { useState, useEffect, useCallback } from 'react'
import { productApi, categoryApi, configApi } from '@/lib/api'
import { DEFAULT_CONFIG, DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '@/data/constants'

export function useStoreData() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Load all data on mount ──────────────────────────────
  useEffect(() => {
    async function loadAll() {
      try {
        const [cfgRes, prodRes, catRes] = await Promise.all([
          configApi.get(),
          productApi.getAll(),
          categoryApi.getAll(),
        ])
        setConfig(prev => ({ ...prev, ...cfgRes }))
        if (prodRes.length > 0) setProducts(prodRes)
        if (catRes.length > 0) setCategories(catRes)
      } catch (err) {
        console.warn('API ບໍ່ພ້ອມ, ໃຊ້ຄ່າເລີ່ມຕ້ນ:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  // ── Config actions ──────────────────────────────────────
  const updateConfig = useCallback(async (newConfig) => {
    setConfig(newConfig)
    try { await configApi.update(newConfig) } catch (e) { console.error(e) }
  }, [])

  const resetAll = useCallback(async () => {
    setLoading(true)
    try {
      await configApi.reset()
      await categoryApi.replaceAll(DEFAULT_CATEGORIES)
      await productApi.replaceAll(DEFAULT_PRODUCTS)
      const [cfgRes, prodRes, catRes] = await Promise.all([
        configApi.get(),
        productApi.getAll(),
        categoryApi.getAll(),
      ])
      setConfig(prev => ({ ...DEFAULT_CONFIG, ...prev, ...cfgRes }))
      setProducts(prodRes.length > 0 ? prodRes : DEFAULT_PRODUCTS)
      setCategories(catRes.length > 0 ? catRes : DEFAULT_CATEGORIES)
    } catch (e) {
      console.error(e)
      setConfig(DEFAULT_CONFIG)
      setProducts(DEFAULT_PRODUCTS)
      setCategories(DEFAULT_CATEGORIES)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Product actions ─────────────────────────────────────
  const addProduct = useCallback(async (data) => {
    try {
      const product = await productApi.create(data)
      setProducts(prev => [...prev, product])
      return product
    } catch (e) {
      console.error(e)
      return null
    }
  }, [])

  const updateProduct = useCallback(async (id, data) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...data, id } : p))
    try { await productApi.update(id, data) } catch (e) { console.error(e) }
  }, [])

  const deleteProduct = useCallback(async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    try { await productApi.delete(id) } catch (e) { console.error(e) }
  }, [])

  const duplicateProduct = useCallback(async (product) => {
    const dupData = { ...product, name: product.name + ' (ສຳເນົາ)' }
    try {
      const dup = await productApi.create(dupData)
      setProducts(prev => [...prev, dup])
      return dup
    } catch (e) {
      console.error(e)
      return null
    }
  }, [])

  // ── Category actions ─────────────────────────────────────
  const addCategory = useCallback(async (data) => {
    if (categories.find(c => c.id === data.id)) return null
    try {
      const cat = await categoryApi.create(data)
      setCategories(prev => [...prev, cat])
      return cat
    } catch (e) {
      console.error(e)
      return null
    }
  }, [categories])

  const updateCategory = useCallback(async (id, label) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, label } : c))
    try { await categoryApi.update(id, { label }) } catch (e) { console.error(e) }
  }, [])

  const deleteCategory = useCallback(async (id) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    try { await categoryApi.delete(id) } catch (e) { console.error(e) }
  }, [])

  return {
    config, products, categories, loading, error,
    updateConfig, resetAll,
    addProduct, updateProduct, deleteProduct, duplicateProduct,
    addCategory, updateCategory, deleteCategory,
  }
}
