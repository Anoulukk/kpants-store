import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productApi, categoryApi, configApi } from '@/lib/api'
import { DEFAULT_CONFIG, DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '@/data/constants'

export function useStoreData() {
  const qc = useQueryClient()

  // ── Queries ──────────────────────────────────────────────
  const { data: config = DEFAULT_CONFIG, isLoading: configLoading } = useQuery({
    queryKey: ['config'],
    queryFn: configApi.get,
    select: (data) => ({ ...DEFAULT_CONFIG, ...data }),
  })

  const { data: products = DEFAULT_PRODUCTS, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getAll,
    select: (data) => data.length > 0 ? data : DEFAULT_PRODUCTS,
  })

  const { data: categories = DEFAULT_CATEGORIES, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
    select: (data) => data.length > 0 ? data : DEFAULT_CATEGORIES,
  })

  const loading = configLoading || productsLoading || categoriesLoading

  // ── Config mutations ─────────────────────────────────────
  const updateConfigMut = useMutation({
    mutationFn: configApi.update,
    onMutate: (newConfig) => {
      qc.setQueryData(['config'], (prev) => ({ ...prev, ...newConfig }))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config'] }),
  })

  const resetAllMut = useMutation({
    mutationFn: async () => {
      await configApi.reset()
      await categoryApi.replaceAll(DEFAULT_CATEGORIES)
      await productApi.replaceAll(DEFAULT_PRODUCTS)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['config'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  // ── Product mutations ────────────────────────────────────
  const addProductMut = useMutation({
    mutationFn: productApi.create,
    onSuccess: (product) => {
      qc.setQueryData(['products'], (prev) => [...(prev || []), product])
    },
  })

  const updateProductMut = useMutation({
    mutationFn: ({ id, data }) => productApi.update(id, data),
    onMutate: ({ id, data }) => {
      qc.setQueryData(['products'], (prev) => prev?.map(p => p.id === id ? { ...data, id } : p))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })

  const deleteProductMut = useMutation({
    mutationFn: productApi.delete,
    onMutate: (id) => {
      qc.setQueryData(['products'], (prev) => prev?.filter(p => p.id !== id))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })

  const duplicateProductMut = useMutation({
    mutationFn: (product) => productApi.create({ ...product, name: product.name + ' (ສຳເນົາ)' }),
    onSuccess: (dup) => {
      qc.setQueryData(['products'], (prev) => [...(prev || []), dup])
    },
  })

  // ── Category mutations ───────────────────────────────────
  const addCategoryMut = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: (cat) => {
      qc.setQueryData(['categories'], (prev) => [...(prev || []), cat])
    },
  })

  const updateCategoryMut = useMutation({
    mutationFn: ({ id, label }) => categoryApi.update(id, { label }),
    onMutate: ({ id, label }) => {
      qc.setQueryData(['categories'], (prev) => prev?.map(c => c.id === id ? { ...c, label } : c))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })

  const deleteCategoryMut = useMutation({
    mutationFn: categoryApi.delete,
    onMutate: (id) => {
      qc.setQueryData(['categories'], (prev) => prev?.filter(c => c.id !== id))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })

  return {
    config, products, categories, loading, error: null,

    updateConfig: (newConfig) => updateConfigMut.mutate(newConfig),
    resetAll: () => resetAllMut.mutateAsync(),

    addProduct: (data) => addProductMut.mutateAsync(data),
    updateProduct: (id, data) => updateProductMut.mutate({ id, data }),
    deleteProduct: (id) => deleteProductMut.mutate(id),
    duplicateProduct: (product) => duplicateProductMut.mutateAsync(product),

    addCategory: (data) => {
      if (categories.find(c => c.id === data.id)) return Promise.resolve(null)
      return addCategoryMut.mutateAsync(data)
    },
    updateCategory: (id, label) => updateCategoryMut.mutate({ id, label }),
    deleteCategory: (id) => deleteCategoryMut.mutate(id),
  }
}
