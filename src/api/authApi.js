/**
 * authApi.js — Umuhinzi Connect auth endpoints.
 *
 * The API returns { success, data } envelopes. Login/register responses are
 * flattened into { token, ...user, name } so the auth screens can build the
 * session user without knowing the backend column names.
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
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') {
      return 'The server took too long to respond. Please check your connection and try again.'
    }
    return 'You appear to be offline. Check your internet connection and try again.'
  }

  const body = error?.response?.data
  if (body?.error) return body.error
  if (body?.message) return body.message
  if (body?.errors && typeof body.errors === 'object') {
    const first = Object.values(body.errors)[0]
    if (typeof first === 'string' && first.trim()) return first
  }
  return error?.message || fallbackMessage
}

const toSession = (payload) => {
  const token = payload?.token
  const user = payload?.user ?? {}
  return {
    ...user,
    token,
    name: user.full_name || user.name || user.email || user.phone
  }
}

export const authApi = {
  login: async ({ phone, password }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
        phone,
        password
      })
      return toSession(unwrapApiResult(response))
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Invalid phone number or password'))
    }
  },

  register: async (payload) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, payload)
      return toSession(unwrapApiResult(response))
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not complete registration'))
    }
  },

  logout: async () => {
    // Stateless JWT auth: clearing the local session is enough.
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.ME)
      return unwrapApiResult(response)?.user ?? null
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not restore your session'))
    }
  },

  updateProfile: async ({ name, phone, email }) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.AUTH.PROFILE, {
        name,
        phone,
        email
      })
      return unwrapApiResult(response)?.user ?? null
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update your profile'))
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.PASSWORD, {
        currentPassword,
        newPassword
      })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not change your password'))
    }
  },

  // --- OTP / 2FA (kept for the restored auth screens) ---
  verifyOtp: async (username, otp) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        username,
        otp
      })
      return toSession(unwrapApiResult(response))
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Invalid code'))
    }
  },

  resendOtp: async (username) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESEND_OTP, {
        username
      })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not resend the code'))
    }
  },

  // --- Password reset (forgot password) ---
  requestPasswordReset: async (email) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email
      })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not request a password reset'))
    }
  },

  verifyPasswordResetOtp: async (email, otp) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.AUTH.VERIFY_PASSWORD_RESET_OTP,
        { email, otp }
      )
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Invalid or expired code'))
    }
  },

  resetPassword: async ({ resetToken, newPassword, confirmPassword }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        resetToken,
        newPassword,
        confirmPassword
      })
      return unwrapApiResult(response)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not reset password'))
    }
  }
}

export default authApi
