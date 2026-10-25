/**
 * AuthContext — global authentication state for Umuhinzi Connect.
 *
 * login(token, user) is intentionally synchronous: the auth forms call the API
 * through src/api/authApi.js first, then persist the returned session here.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

export const TOKEN_KEY = 'umuhinzi_token'
export const USER_KEY = 'umuhinzi_user'

export const AuthContext = createContext(undefined)

const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

export const isTokenValid = (token) => {
  if (!token) return false
  const claims = decodeJwt(token)
  if (!claims?.exp) return false
  return claims.exp * 1000 > Date.now()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken && storedUser && isTokenValid(storedToken)) {
      try {
        const parsed = JSON.parse(storedUser)
        if (!parsed?.role) throw new Error('Invalid session shape')
        setToken(storedToken)
        setUser(parsed)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }

    setIsInitialized(true)
  }, [])

  useEffect(() => {
    const onUnauthorized = () => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setToken(null)
      setUser(null)
    }
    window.addEventListener('umuhinzi:unauthorized', onUnauthorized)
    return () => window.removeEventListener('umuhinzi:unauthorized', onUnauthorized)
  }, [])

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const persistUser = useCallback((next) => {
    setUser((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next
      if (resolved) localStorage.setItem(USER_KEY, JSON.stringify(resolved))
      else localStorage.removeItem(USER_KEY)
      return resolved
    })
  }, [])

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user && isTokenValid(token)),
    isInitialized,
    login,
    logout,
    setUser: persistUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
