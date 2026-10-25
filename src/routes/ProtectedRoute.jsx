/**
 * ProtectedRoute — gate for authenticated (and optionally role-restricted)
 * sections of the app.
 *
 * - Not authenticated            → redirect to /login (deep-link preserved).
 * - requireRole given & mismatch → redirect to /dashboard (owner-only areas
 *   like Reports, Workers, Settings must never render for staff/workers).
 * - Allowed                      → render <Outlet /> for nested routes.
 *
 * Backed by AuthContext + constants/roles.js + utils/permissionHelpers.js.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTE_PATHS } from '../constants/routePaths'
import { hasRole } from '../utils/permissionHelpers'
import { dashboardPathForRoles } from '../utils/dashboardPath'

export default function ProtectedRoute({ requireRole }) {
  const { isAuthenticated, isInitialized, user } = useAuth()
  const location = useLocation()

  if (!isInitialized) {
    return null // TODO: render a full-screen <Loader /> while the session restores
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace state={{ from: location }} />
  }

  if (requireRole && !hasRole(user, requireRole)) {
    return <Navigate to={dashboardPathForRoles(user)} replace />
  }

  return <Outlet />
}