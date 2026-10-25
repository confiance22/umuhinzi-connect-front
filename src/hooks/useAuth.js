/**
 * useAuth.js — access auth state + actions from any component.
 * Thin wrapper over AuthContext (see src/context/AuthContext.jsx).
 */
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useAuth() {
  return useContext(AuthContext)
}

export default useAuth