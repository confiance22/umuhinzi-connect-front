/**
 * AccountPage — role-aware "my account". Workers get the simple phone-friendly
 * WorkerProfilePage; managers and super admins keep the full portal account
 * page. Rendered at /account inside the authenticated layout tree.
 */
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { ROLES } from '../constants/roles'
import AdminAccountPage from '../features/admin/pages/AdminAccountPage'
import WorkerProfilePage from '../features/worker/pages/WorkerProfilePage'

export default function AccountPage() {
  const { user } = useAuth()
  return user?.role === ROLES.WORKER ? <WorkerProfilePage /> : <AdminAccountPage />
}