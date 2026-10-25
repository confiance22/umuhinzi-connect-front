/**
 * permissionHelpers.js — single source of truth for role-based capabilities.
 *
 * SUPER_ADMIN  — platform-wide admin (opens /admin/*).
 * SHOP_MANAGER — manager-level access inside the shop (workers, reports,
 *                settings). "owner" semantics renamed for the new role model.
 * WORKER       — product/stock/QR flows only.
 *
 * Used by <ProtectedRoute> gates, usePermissions() and the UI so every layer
 * relies on one definition.
 */
import { ROLES } from '../constants/roles'

export function hasRole(user, role) {
  return Boolean(user && user.role === role)
}

export function isSuperAdmin(user) {
  return hasRole(user, ROLES.SUPER_ADMIN)
}

/** Manager-level access = the shop owner/manager OR the platform admin. */
export function isOwner(user) {
  return isSuperAdmin(user) || hasRole(user, ROLES.SHOP_MANAGER)
}

export function can(user, capability) {
  // TODO(implementation): capability lookup against a permission matrix keyed
  // by role; capability names like 'worker.manage', 'report.view', 'record.delete'
  return false
}