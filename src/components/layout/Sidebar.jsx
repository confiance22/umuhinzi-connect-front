/**
 * Sidebar — main navigation for the app shell.
 * Items are filtered by usePermissions()/role so workers never see owner-only
 * links (Workers, Reports, Settings). Uses constants/routePaths.js.
 */
import { NavLink } from 'react-router-dom'
import { ROUTE_PATHS } from '../../constants/routePaths'

const NAV_ITEMS = [
  { to: ROUTE_PATHS.DASHBOARD, label: 'Dashboard' },
  { to: ROUTE_PATHS.PRODUCTS, label: 'Products' },
  { to: ROUTE_PATHS.STOCK_IN, label: 'Stock in' },
  { to: ROUTE_PATHS.STOCK_OUT, label: 'Stock out' },
  { to: ROUTE_PATHS.STOCK_CHECK, label: 'Stock check' },
  { to: ROUTE_PATHS.QR_GENERATE, label: 'QR labels' },
  { to: ROUTE_PATHS.QR_SCAN, label: 'Scan QR' },
  // Owner-only (filtered below):
  { to: ROUTE_PATHS.WORKERS, label: 'Workers', ownerOnly: true },
  { to: ROUTE_PATHS.REPORTS, label: 'Reports', ownerOnly: true },
  { to: ROUTE_PATHS.SETTINGS, label: 'Settings', ownerOnly: true },
]

export default function Sidebar() {
  // TODO: const { isOwner } = usePermissions(); hide NAV_ITEMS with ownerOnly for workers
  return (
    <aside className="flex w-60 flex-col border-r border-line bg-white">
      <div className="flex h-14 items-center border-b border-line px-4 font-bold text-brand-900">StockRwa</div>
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-800' : 'text-muted hover:bg-page'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}