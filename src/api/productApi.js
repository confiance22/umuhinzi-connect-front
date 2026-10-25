/**
 * productApi.js — product CRUD + search endpoints consumed by Products pages.
 * Everything is backed by the live StockRwa API; errors surface as Error(message).
 */
import axiosInstance from './axiosInstance'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

const unwrapApiResult = (response) => {
  if (response?.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data
  }
  return response.data
}

const asList = (data) => (Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [])

const getApiErrorMessage = (error, fallbackMessage) => {
  const body = error?.response?.data
  if (body?.message) return body.message
  if (body?.errors && typeof body.errors === 'object') {
    const first = Object.values(body.errors)[0]
    if (typeof first === 'string' && first.trim()) return first
  }
  return error?.message || fallbackMessage
}

export const productApi = {
  /* The API pages the catalogue at 50/page. Every consumer (products table, SKU
     KPIs, dashboards, stock pickers) expects the FULL catalogue, so keep pulling
     pages until `total` is reached instead of silently showing only page one. */
  async list(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.BASE, { params })
    const body = unwrapApiResult(response)
    if (Array.isArray(body)) return body
    const firstItems = Array.isArray(body?.items) ? body.items : []
    const total = Number(body?.total) || firstItems.length
    if (total <= firstItems.length) return firstItems
    const pageSize = Math.max(1, firstItems.length)
    const pageCount = Math.ceil(total / pageSize)
    const rest = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, i) =>
        axiosInstance
          .get(API_ENDPOINTS.PRODUCTS.BASE, { params: { ...params, page: i + 2 } })
          .then((r) => {
            const b = unwrapApiResult(r)
            return Array.isArray(b) ? b : Array.isArray(b?.items) ? b.items : []
          })
      )
    )
    return [...firstItems, ...rest.flat()]
  },

  async get(id) {
    const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.DETAIL(id))
    return unwrapApiResult(response)
  },

  async create(payload) {
    const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.BASE, payload)
    return unwrapApiResult(response)
  },

  async update(id, payload) {
    const response = await axiosInstance.put(API_ENDPOINTS.PRODUCTS.DETAIL(id), payload)
    return unwrapApiResult(response)
  },

  async remove(id) {
    const response = await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.DETAIL(id))
    return unwrapApiResult(response)
  },

  async search(query) {
    const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params: { q: query } })
    return asList(unwrapApiResult(response))
  },

  async verify(id) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.PRODUCTS.DETAIL(id)}/verify`)
    return unwrapApiResult(response)
  },

  async verifyAll() {
    const response = await axiosInstance.post(`${API_ENDPOINTS.PRODUCTS.BASE}/verify-all`)
    return unwrapApiResult(response)
  },

  async unverify(id) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.PRODUCTS.DETAIL(id)}/unverify`)
    return unwrapApiResult(response)
  },
}

export default productApi