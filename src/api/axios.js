import axios from 'axios'

export const TOKEN_KEY = 'umuhinzi_token'
export const USER_KEY = 'umuhinzi_user'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error?.config?.url ?? ''
    const isAuthAttempt =
      url.includes('/auth/login') || url.includes('/auth/register')

    if (error?.response?.status === 401 && !isAuthAttempt) {
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
  }
)

export default api
