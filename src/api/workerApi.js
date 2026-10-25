/**
 * workerApi.js — staff/worker management (SHOP MANAGER ONLY) + self-service
 * (profile, login PIN, shop profile, password). Workers sign in with a
 * memorised 4-digit PIN assigned by their shop manager; the worker's identity
 * is the actor recorded on every stock movement, tying management directly to
 * the audit trail. Everything is backed by the live StockRwa API; errors
 * surface as Error(message).
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

export const workerApi = {
  async list(params) {
    const response = await axiosInstance.get(API_ENDPOINTS.WORKERS.BASE, { params })
    return asList(unwrapApiResult(response))
  },

  async get(id) {
    const response = await axiosInstance.get(API_ENDPOINTS.WORKERS.DETAIL(id))
    return unwrapApiResult(response)
  },

  async create(payload) {
    const response = await axiosInstance.post(API_ENDPOINTS.WORKERS.BASE, payload)
    return unwrapApiResult(response)
  },

  async update(id, payload) {
    const response = await axiosInstance.put(API_ENDPOINTS.WORKERS.DETAIL(id), payload)
    return unwrapApiResult(response)
  },

  /** enabled: true → activate, false → deactivate (soft-disable staff). */
  async setStatus(id, enabled) {
    const response = await axiosInstance.patch(API_ENDPOINTS.WORKERS.DETAIL(id), { enabled: Boolean(enabled) })
    return unwrapApiResult(response)
  },

  /** Temporary stock-in: manager grants/revokes a worker's ability to receive stock. */
  async setStockIn(id, enabled) {
    const response = await axiosInstance.put(API_ENDPOINTS.WORKERS.DETAIL(id), { stockInEnabled: Boolean(enabled) })
    return unwrapApiResult(response)
  },

  async remove(id) {
    const response = await axiosInstance.delete(API_ENDPOINTS.WORKERS.DETAIL(id))
    return unwrapApiResult(response)
  },

  /** Removal/deactivation of a co-manager requires their own approval.
   *  Returns { approvalRequired, requestId, message } when a request is created. */
  async getRemovalRequests() {
    const response = await axiosInstance.get(API_ENDPOINTS.WORKERS.REMOVAL_REQUESTS)
    return asList(unwrapApiResult(response))
  },

  async approveRemovalRequest(id) {
    const response = await axiosInstance.post(API_ENDPOINTS.WORKERS.REMOVAL_REQUEST_APPROVE(id))
    return unwrapApiResult(response)
  },

  async rejectRemovalRequest(id) {
    const response = await axiosInstance.post(API_ENDPOINTS.WORKERS.REMOVAL_REQUEST_REJECT(id))
    return unwrapApiResult(response)
  },

  /** A user updating their OWN identity (PUT /workers/me/profile).
   *  Workers may only change { username }; shop managers may also send
   *  { name, phone, nationalId, email }. */
  async updateSelf(payload) {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.WORKERS.ME_PROFILE, {
        ...(payload.name?.trim() ? { name: payload.name.trim() } : {}),
        ...(payload.phone?.trim() ? { phone: payload.phone.trim() } : {}),
        ...(payload.nationalId?.trim() ? { nationalId: payload.nationalId.trim() } : {}),
        ...(payload.username?.trim() ? { username: payload.username.trim() } : {}),
        ...(payload.email?.trim() ? { email: payload.email.trim().toLowerCase() } : {}),
        ...(payload.otpEnabled != null ? { otpEnabled: Boolean(payload.otpEnabled) } : {}),
      })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update your profile'))
    }
  },

  /** A shop manager changing their own login password (POST /workers/me/password). */
  async changePassword({ currentPassword, newPassword }) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.WORKERS.ME_PASSWORD, {
        currentPassword,
        newPassword,
      })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not change password'))
    }
  },

  /** A worker changing their own login PIN (POST /workers/me/pin). */
  async changePin({ currentPin, newPin }) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.WORKERS.ME_PIN, {
        currentPin,
        newPin,
      })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not change PIN'))
    }
  },

  /** A shop manager reading their own shop profile (GET /workers/me/shop). */
  async getMyShop() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.WORKERS.ME_SHOP)
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load shop profile'))
    }
  },

  /** A shop manager updating their own shop profile (PUT /workers/me/shop). */
  async updateMyShop(payload) {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.WORKERS.ME_SHOP, {
        ...(payload.name?.trim() ? { name: payload.name.trim() } : {}),
        ...(payload.address != null ? { address: String(payload.address).trim() } : {}),
        ...(payload.contactPersonEmail?.trim()
          ? { contactPersonEmail: payload.contactPersonEmail.trim().toLowerCase() }
          : {}),
        ...(payload.contactPersonPhone != null
          ? { contactPersonPhone: String(payload.contactPersonPhone).trim() }
          : {}),
        ...(payload.website != null ? { website: String(payload.website).trim() } : {}),
      })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update shop profile'))
    }
  },
}

export default workerApi