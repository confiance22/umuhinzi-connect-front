/**
 * shopsApi.js — Shop directory, approval & status endpoints (Super Admin).
 * Public self-signups arrive as PENDING and must be approved before the shop
 * can sign in. Shops created by an admin are approved immediately. Everything
 * is backed by the live StockRwa API; errors surface as Error(message).
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

export const shopsApi = {
  getShops: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.SHOPS)
      return asList(unwrapApiResult(response))
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load shops'))
    }
  },

  createShop: async (payload) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.SHOPS, payload)
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not create shop'))
    }
  },

  setShopStatus: async (id, active) => {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.SHOP_STATUS(id), { active: Boolean(active) })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update shop status'))
    }
  },

  /** Approve a pending shop — makes it active and available for sign-in. */
  approveShop: async (id) => {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.SHOP_APPROVAL(id), { approvalStatus: 'APPROVED' })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not approve shop'))
    }
  },

  /** Reject a pending shop, optionally with a reason shown to the manager. */
  rejectShop: async (id, rejectionReason = '') => {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.SHOP_APPROVAL(id), {
        approvalStatus: 'REJECTED',
        rejectionReason: rejectionReason || null,
      })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not reject shop'))
    }
  },
}

export default shopsApi