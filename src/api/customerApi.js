/**
 * customerApi.js — customer ledger: customer records + their stock-out history.
 * Backed by the live StockRwa API; errors surface as Error(message).
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

export const customerApi = {
  async list(params) {
    const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS.BASE, { params })
    return asList(unwrapApiResult(response))
  },

  async get(id) {
    const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS.DETAIL(id))
    return unwrapApiResult(response)
  },

  async create(payload) {
    const response = await axiosInstance.post(API_ENDPOINTS.CUSTOMERS.BASE, payload)
    return unwrapApiResult(response)
  },

  async update(id, payload) {
    const response = await axiosInstance.put(API_ENDPOINTS.CUSTOMERS.DETAIL(id), payload)
    return unwrapApiResult(response)
  },

  async remove(id) {
    const response = await axiosInstance.delete(API_ENDPOINTS.CUSTOMERS.DETAIL(id))
    return unwrapApiResult(response)
  },
}

export default customerApi