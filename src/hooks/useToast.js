/**
 * useToast.js — access global notifications from any component.
 * Thin wrapper over ToastContext (see src/context/ToastContext.jsx).
 */
import { useContext } from 'react'
import { ToastContext } from '../context/ToastContext'

export function useToast() {
  return useContext(ToastContext)
}

export default useToast