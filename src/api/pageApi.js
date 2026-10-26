import axiosInstance from './axiosInstance'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

const unwrap = (res) => {
  if (res?.data && typeof res.data === 'object' && 'data' in res.data) {
    return res.data.data
  }
  return res.data
}

export const pageApi = {
  list: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.PAGES.BASE)
    return unwrap(res)
  },
  get: async (slug) => {
    const res = await axiosInstance.get(API_ENDPOINTS.PAGES.DETAIL(slug))
    return unwrap(res)
  },
}

export default pageApi