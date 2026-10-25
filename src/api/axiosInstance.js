/**
 * axiosInstance.js — shared Axios instance for the Umuhinzi Connect backend.
 *
 * BASE URL      → import.meta.env.VITE_API_URL (see .env.example).
 * AUTH TOKEN    → attached as a Bearer header on every request. AuthContext is
 *                 the single writer of the token/user keys in localStorage.
 * ERROR HANDLING→ a 401 mid-session means the token expired/was revoked:
 *                 clear the session and dispatch 'umuhinzi:unauthorized' so the
 *                 AuthProvider can bounce the user to /login. /auth routes are
 *                 exempt (login failures / refresh carry their own errors).
 */
import axios from 'axios'
import { TOKEN_KEY, USER_KEY } from '../context/AuthContext'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  'http://localhost:5000/api'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error?.config?.url?.startsWith('/auth')
    if (error?.response?.status === 401 && !isAuthRoute) {
      try {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      } catch {
        /* storage may be unavailable */
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('umuhinzi:unauthorized'))
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance