/**
 * AccountPage — role-aware "my account". Super admins use the admin account
 * screen; farmers and buyers use the self-service profile/password page.
 */
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { ROLES } from '../constants/roles'
import AdminAccountPage from '../features/admin/pages/AdminAccountPage'
import FarmerAccountPage from '../features/manager/pages/FarmerAccountPage'

export default function AccountPage() {
  const { user } = useAuth()
  return user?.role === ROLES.SUPER_ADMIN ? <AdminAccountPage /> : <FarmerAccountPage />
}
