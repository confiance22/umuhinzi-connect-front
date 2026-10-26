/**
 * ManagerLayout — Shop Manager portal shell. Thin wrapper over the shared
 * PortalLayout (same chrome as the Super Admin portal); only the nav and
 * branding differ. All manager flows (dashboard, products, stock, QR,
 * workers, reports, settings) render inside this shell.
 */
import PortalLayout from '../admin/PortalLayout'
import { ROUTE_PATHS } from '../../constants/routePaths'
import { useAuth } from '../../hooks/useAuth'
import { useChat } from '../../hooks/useChat'

const NAV = [
  {
    id: 'products',
    title: 'Products',
    icon: 'box',
    items: [
      { label: 'All Products', to: ROUTE_PATHS.PRODUCTS, icon: 'box' },
      { label: 'Add Product', to: ROUTE_PATHS.PRODUCT_ADD, icon: 'plus' },
    ],
  },
  {
    id: 'stock',
    title: 'Stock',
    icon: 'stockCheck',
    items: [
      { label: 'Stock In', to: ROUTE_PATHS.STOCK_IN, icon: 'stockIn' },
      { label: 'Stock Out', to: ROUTE_PATHS.STOCK_OUT, icon: 'stockOut' },
      { label: 'Stock Check', to: ROUTE_PATHS.STOCK_CHECK, icon: 'stockCheck' },
      { label: 'Customers & Ledger', to: ROUTE_PATHS.CUSTOMERS, icon: 'customers' },
    ],
  },
  {
    id: 'qr',
    title: 'QR Codes',
    icon: 'qr',
    items: [
      { label: 'Generate Labels', to: ROUTE_PATHS.QR_GENERATE, icon: 'qr' },
      { label: 'Scan QR', to: ROUTE_PATHS.QR_SCAN, icon: 'scan' },
    ],
  },
  {
    id: 'team',
    title: 'Workers',
    icon: 'users',
    items: [{ label: 'Workers', to: ROUTE_PATHS.WORKERS, icon: 'users' }],
  },
  {
    id: 'chat',
    title: 'Communication',
    icon: 'chat',
    items: [
      { label: 'Shop Chat', to: ROUTE_PATHS.CHAT, icon: 'chat', badge: 0 },
      { label: 'Notifications', to: ROUTE_PATHS.NOTIFICATIONS, icon: 'bell' },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: 'reports',
    highlight: true,
    items: [
      { label: 'Overall Summary', to: ROUTE_PATHS.REPORTS, icon: 'overview' },
      { label: 'Stock In Report', to: ROUTE_PATHS.REPORTS_STOCK_IN, icon: 'stockIn' },
      { label: 'Stock Out Report', to: ROUTE_PATHS.REPORTS_STOCK_OUT, icon: 'stockOut' },
      { label: 'All Products', to: ROUTE_PATHS.REPORTS_PRODUCTS, icon: 'box' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    items: [
      { label: 'Shop & Account', to: ROUTE_PATHS.SETTINGS_SHOP, icon: 'shop' },
      { label: 'Inventory & QR', to: ROUTE_PATHS.SETTINGS_INVENTORY, icon: 'qr' },
      { label: 'Security & Access', to: ROUTE_PATHS.SETTINGS_SECURITY, icon: 'shield' },
    ],
  },
]

export const ManagerLayout = () => {
  const { user } = useAuth()
  const chatUnread = useChat().unread
  const nav = NAV.map((section) =>
    section.id === 'chat'
      ? {
          ...section,
          items: section.items.map((item) => ({ ...item, badge: chatUnread })),
        }
      : section
  )
  return (
    <PortalLayout
      subtitle="Shop Manager Portal"
      breadcrumbLabel="Rwanda · Shop Manager"
      overview={{ label: 'Overview', to: ROUTE_PATHS.DASHBOARD, icon: 'overview' }}
      sections={nav}
      accountPath={ROUTE_PATHS.ACCOUNT}
      extraTitles={{ [ROUTE_PATHS.ACCOUNT]: 'My Account' }}
      notificationScope={`shop:${user?.shopId || 1}`}
    />
  )
}

export default ManagerLayout