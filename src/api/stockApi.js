/**
 * stockApi.js — stock movements (in/out), current levels and stock-check/audit
 * sessions. Every movement submits actorId (the logged-in user) so the backend
 * records the audit trail: WHO moved/removed stock, WHEN and WHY.
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

export const stockApi = {
  async getLevels(params) {
    const response = await axiosInstance.get(API_ENDPOINTS.STOCK.LEVELS, { params })
    return asList(unwrapApiResult(response))
  },

  async getMovements(params) {
    const response = await axiosInstance.get(API_ENDPOINTS.STOCK.MOVEMENTS, { params })
    return asList(unwrapApiResult(response))
  },

  async recordStockIn(payload) {
    const result = await axiosInstance.post(API_ENDPOINTS.STOCK.IN, payload)
    return unwrapApiResult(result)
  },

  async recordStockOut(payload) {
    const result = await axiosInstance.post(API_ENDPOINTS.STOCK.OUT, payload)
    return unwrapApiResult(result)
  },

  async recordStockOutBatch(payload) {
    const result = await axiosInstance.post(API_ENDPOINTS.STOCK.OUT_BATCH, payload)
    return unwrapApiResult(result)
  },

  async startStockCheck(payload) {
    const response = await axiosInstance.post(API_ENDPOINTS.STOCK.CHECKS, payload)
    return unwrapApiResult(response)
  },

  async submitStockCheck(checkId, results) {
    const response = await axiosInstance.post(API_ENDPOINTS.STOCK.CHECK_DETAIL(checkId), results)
    return unwrapApiResult(response)
  },

  async listStockChecks(params) {
    const response = await axiosInstance.get(API_ENDPOINTS.STOCK.CHECKS, { params })
    return asList(unwrapApiResult(response))
  },
}

export default stockApi