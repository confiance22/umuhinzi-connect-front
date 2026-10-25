/**
 * usePermissions.js — role-based capability helpers for the current user
 * (owner vs worker/staff). Backed by utils/permissionHelpers.js so route guards
 * and UI hints share one permission matrix.
 */
import { useAuth } from './useAuth'
import { isOwner } from '../utils/permissionHelpers'

export function usePermissions() {
  const { user } = useAuth()

  return {
    user,
    isOwner: isOwner(user),
    can: (capability) => false, // TODO(implementation): permissionHelpers.can(user, capability)
    canManageWorkers: false, // TODO: depends on role
    canViewReports: false, // TODO: depends on role
    canDeleteRecords: false, // TODO: owner only
  }
}

export default usePermissions