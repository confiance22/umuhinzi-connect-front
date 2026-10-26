import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { roleHome } from '../utils/roles'
import Loader from './Loader'

export default function ProtectedRoute({ requireRole }) {
  const { isAuthenticated, isInitialized, user } = useAuthContext()
  const location = useLocation()

  if (!isInitialized) {
    return <Loader label="Restoring your session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const role = user?.role === 'admin' ? 'super_admin' : user?.role
  if (requireRole && role !== requireRole) {
    return <Navigate to={roleHome(user?.role)} replace />
  }

  return <Outlet />
}
