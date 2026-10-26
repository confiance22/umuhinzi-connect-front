import axiosInstance from './axiosInstance'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

const unwrap = (res) => {
  if (res?.data && typeof res.data === 'object' && 'data' in res.data) {
    return res.data.data
  }
  return res.data
}

export const marketPriceApi = {
  list: async (params = {}) => {
    const res = await axiosInstance.get(API_ENDPOINTS.MARKET_PRICES.BASE, { params })
    return unwrap(res)
  },
  getDistricts: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.MARKET_PRICES.DISTRICTS)
    return unwrap(res)
  },
  getMarkets: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.MARKET_PRICES.MARKETS)
    return unwrap(res)
  },
  getCrops: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.MARKET_PRICES.CROPS)
    return unwrap(res)
  },
}

export default marketPriceApi