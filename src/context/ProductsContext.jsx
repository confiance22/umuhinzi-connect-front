/**
 * ProductsContext — global product store.
 * Holds the products list, pagination/search state, loading/error flags and
 * CRUD actions consumed by the Products pages. Centralizing here lets the
 * Dashboard and QR pages share the same product data without refetch storms.
 */
import React, { createContext, useContext, useState } from 'react'

export const ProductsContext = createContext({
  products: [],
  total: 0,
  page: 1,
  search: '',
  loading: false,
  error: null,
  fetchProducts: () => {},
  addProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {},
})

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // TODO(implementation): wire to productApi (list/search/create/update/remove)
  // and keep optimistic updates + setLoading/setError consistent.

  const value = {
    products,
    total,
    page,
    search,
    loading,
    error,
    fetchProducts: () => {},
    addProduct: () => {},
    updateProduct: () => {},
    deleteProduct: () => {},
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProductsContext() {
  return useContext(ProductsContext)
}