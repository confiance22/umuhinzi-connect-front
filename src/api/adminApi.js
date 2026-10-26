/**
 * adminApi.js — Super Admin portal endpoints (users / roles / permissions).
 * Every method throws Error(message) on failure (mapped from the backend body).
 * Everything is backed by the live Umuhinzi Connect API.
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

export const adminApi = {
  // ── Users ──────────────────────────────────────────────────────────────
  getUsers: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.USERS)
      return asList(unwrapApiResult(response))
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load users'))
    }
  },

  createUser: async (payload) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.USERS, payload)
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not create user'))
    }
  },

  updateUser: async (id, payload) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.USER_DETAIL(id), payload)
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update user'))
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.ADMIN.USER_DETAIL(id))
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not delete user'))
    }
  },

  /** enabled: true → activate, false → deactivate (soft-disable). */
  setUserStatus: async (id, enabled) => {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.USER_DETAIL(id), { enabled: Boolean(enabled) })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update user status'))
    }
  },

  lockUser: async (id) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.USER_BLOCK(id))
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not lock account'))
    }
  },

  unlockUser: async (id) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.USER_UNBLOCK(id))
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not unlock account'))
    }
  },

  // ── Roles ──────────────────────────────────────────────────────────────
  getRoles: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.ROLES)
      return asList(unwrapApiResult(response))
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load roles'))
    }
  },

  createRole: async (payload) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.ROLES, payload)
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not create role'))
    }
  },

  updateRole: async (id, payload) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.ROLE_DETAIL(id), payload)
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update role'))
    }
  },

  deleteRole: async (id) => {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.ADMIN.ROLE_DETAIL(id))
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not delete role'))
    }
  },

  setRoleStatus: async (id, active) => {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ADMIN.ROLE_DETAIL(id), { active: Boolean(active) })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update role status'))
    }
  },

  assignRolePermissions: async (id, permissionIds) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.ROLE_PERMISSIONS(id), { permissionIds })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update permissions'))
    }
  },

  // ── Permissions ────────────────────────────────────────────────────────
  getPermissions: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.PERMISSIONS)
      return asList(unwrapApiResult(response))
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load permissions'))
    }
  },

  // ── Self-service (signed-in super admin) ──────────────────────────────
  /** Authenticated admin updating their own profile (PUT /admin/me/profile). */
  updateSelf: async (payload) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.ME_PROFILE, payload)
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update your profile'))
    }
  },

  /** Authenticated admin changing their own password (POST /admin/me/password). */
  changePassword: async ({ currentPassword, newPassword }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.ME_PASSWORD, {
        currentPassword,
        newPassword,
      })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not change password'))
    }
  },

  // ── Platform reports ──────────────────────────────────────────────────
  getReportsOverview: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.REPORTS_OVERVIEW)
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load platform overview'))
    }
  },

  getReportsShops: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.REPORTS_SHOPS)
      return asList(unwrapApiResult(response))
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load shop report'))
    }
  },

  getReportsTrends: async (days = 30) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.REPORTS_TRENDS(days))
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load registration trends'))
    }
  },

  // ── Platform settings ─────────────────────────────────────────────────
  getSettings: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.SETTINGS)
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load platform settings'))
    }
  },

  updateSettings: async (payload) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.SETTINGS, payload)
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update platform settings'))
    }
  },
}

export default adminApi