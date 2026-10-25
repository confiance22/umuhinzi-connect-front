/**
 * settingsApi.js — platform policy settings for authenticated shop users
 * (super admins use adminApi which hits /admin/settings).
 * Throws Error(message) on failure (mapped from the backend body).
 */
import axiosInstance from './axiosInstance'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

const unwrapApiResult = (response) => {
  if (response?.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data
  }
  return response.data
}

export const settingsApi = {
  getSettings: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.SETTINGS)
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(error?.response?.data?.message || 'Could not load platform settings')
    }
  },
}

export default settingsApi