/**
 * AdminRoute — gate for the Super Admin portal (/admin/*).
 * - Not authenticated            → /login (handled by the parent ProtectedRoute)
 * - Authenticated but not super admin → /dashboard (shop shell) — never render
 *   platform controls for shop staff.
 * - Allowed                      → render <Outlet /> for the admin pages.
 *
 * Backed by AuthContext + utils/permissionHelpers.isSuperAdmin.
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTE_PATHS } from '../constants/routePaths'
import { isSuperAdmin } from '../utils/permissionHelpers'

export default function AdminRoute() {
  const { user } = useAuth()

  if (!isSuperAdmin(user)) {
    return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />
  }

  return <Outlet />
}