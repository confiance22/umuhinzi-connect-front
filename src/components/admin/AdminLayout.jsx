/**
 * AdminLayout — Super Admin portal shell. Uses the shared PortalLayout with
 * Umuhinzi Connect navigation and branding.
 */
import PortalLayout from './PortalLayout'
import { ROUTE_PATHS } from '../../constants/routePaths'

const NAV = [
  {
    id: 'people',
    title: 'People & Access',
    icon: 'users',
    items: [
      { label: 'Users', to: ROUTE_PATHS.ADMIN_USERS, icon: 'users' },
      { label: 'Roles', to: ROUTE_PATHS.ADMIN_ROLES, icon: 'roles' },
      { label: 'Permissions', to: ROUTE_PATHS.ADMIN_PERMISSIONS, icon: 'permissions' },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    icon: 'chat',
    items: [
      { label: 'Notifications', to: ROUTE_PATHS.ADMIN_NOTIFICATIONS, icon: 'bell' },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    icon: 'settings',
    items: [
      { label: 'Profile & Security', to: ROUTE_PATHS.ADMIN_ACCOUNT, icon: 'shield' },
    ],
  },
]

export const AdminLayout = () => (
  <PortalLayout
    subtitle="Super Admin"
    breadcrumbLabel="Rwanda · Umuhinzi Connect"
    overview={{ label: 'Overview', to: ROUTE_PATHS.ADMIN_DASHBOARD, icon: 'overview' }}
    sections={NAV}
    accountPath={ROUTE_PATHS.ADMIN_ACCOUNT}
  />
)

export default AdminLayout
