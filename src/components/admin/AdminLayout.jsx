/**
 * AdminLayout — Super Admin portal shell. Thin wrapper over the shared
 * PortalLayout so the admin and shop-manager portals are identical by
 * construction; only the nav/branding differ.
 */
import PortalLayout from './PortalLayout'
import { ROUTE_PATHS } from '../../constants/routePaths'
import { useChat } from '../../hooks/useChat'

const NAV = [
  {
    id: 'shops',
    title: 'Shops',
    icon: 'shop',
    items: [{ label: 'Shops', to: ROUTE_PATHS.ADMIN_SHOPS, icon: 'shop' }],
  },
  {
    id: 'user-management',
    title: 'User Management',
    icon: 'users',
    items: [
      { label: 'Users', to: ROUTE_PATHS.ADMIN_USERS, icon: 'users' },
      { label: 'Roles', to: ROUTE_PATHS.ADMIN_ROLES, icon: 'roles' },
      { label: 'Permissions', to: ROUTE_PATHS.ADMIN_PERMISSIONS, icon: 'permissions' },
    ],
  },
  {
    id: 'chat',
    title: 'Chat',
    icon: 'chat',
    items: [{ label: 'Shop Chats', to: ROUTE_PATHS.ADMIN_CHAT, icon: 'chat', badge: 0 }],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: 'reports',
    items: [{ label: 'Reports', to: ROUTE_PATHS.ADMIN_REPORTS, icon: 'reports' }],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    items: [
      { label: 'Settings Hub', to: ROUTE_PATHS.ADMIN_SETTINGS, icon: 'settings' },
      { label: 'Security & OTP', to: ROUTE_PATHS.ADMIN_SETTINGS_SECURITY, icon: 'shield' },
      { label: 'Shop Policies', to: ROUTE_PATHS.ADMIN_SETTINGS_SHOPS, icon: 'globe' },
      { label: 'Products & Pricing', to: ROUTE_PATHS.ADMIN_SETTINGS_PRODUCTS, icon: 'box' },
    ],
  },
]

export const AdminLayout = () => {
  const chatUnread = useChat().unread
  const nav = NAV.map((section) =>
    section.id === 'chat'
      ? { ...section, items: section.items.map((item) => ({ ...item, badge: chatUnread })) }
      : section
  )
  return (
    <PortalLayout
      subtitle="Super Admin Portal"
      breadcrumbLabel="Rwanda · Super Admin"
      overview={{ label: 'Overview', to: ROUTE_PATHS.ADMIN_DASHBOARD, icon: 'overview' }}
      sections={nav}
      accountPath={ROUTE_PATHS.ADMIN_ACCOUNT}
      extraTitles={{
        [ROUTE_PATHS.ADMIN_ACCOUNT]: 'My Account',
        [ROUTE_PATHS.ADMIN_CHAT]: 'Shop Chats',
        [ROUTE_PATHS.ADMIN_SETTINGS]: 'Settings',
        [ROUTE_PATHS.ADMIN_SETTINGS_SECURITY]: 'Security & OTP',
        [ROUTE_PATHS.ADMIN_SETTINGS_SHOPS]: 'Shop Policies',
        [ROUTE_PATHS.ADMIN_SETTINGS_PRODUCTS]: 'Products & Pricing',
      }}
    />
  )
}

export default AdminLayout