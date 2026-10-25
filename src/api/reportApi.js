/**
 * reportApi.js — reports & analytics endpoints (SHOP MANAGER / OWNER ONLY).
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

const getApiErrorMessage = (error, fallbackMessage) => {
  const body = error?.response?.data
  if (body?.message) return body.message
  if (body?.errors && typeof body.errors === 'object') {
    const first = Object.values(body.errors)[0]
    if (typeof first === 'string' && first.trim()) return first
  }
  return error?.message || fallbackMessage
}

export const reportApi = {
  async getSummary(params) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.SUMMARY, { params })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load report summary'))
    }
  },

  async getMovements(params) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.MOVEMENTS, { params })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load movement report'))
    }
  },

  async getValuation(params) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.VALUATION, { params })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load valuation report'))
    }
  },

  async getLowStock(params) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.LOW_STOCK, { params })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load low-stock report'))
    }
  },

  async getFullReport(params) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.FULL, { params })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load the full report'))
    }
  },
}

export default reportApi