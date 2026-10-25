/**
 * ToastContext — global notifications (success / error / info) rendered by
 * components/common/Toast. Placed outside AuthProvider so errors can surface
 * even during login/registration flows.
 */
import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

export const ToastContext = createContext({
  toasts: [],
  showToast: () => {},
  dismissToast: () => {},
})

let toastCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      toastCounter += 1
      const id = `toast-${Date.now()}-${toastCounter}`
      setToasts((prev) => [...prev, { id, message, type }])
      const timer = setTimeout(() => dismissToast(id), duration)
      timersRef.current.set(id, timer)
    },
    [dismissToast]
  )

  const value = { toasts, showToast, dismissToast }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToastContext() {
  return useContext(ToastContext)
}