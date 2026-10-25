/**
 * permissions.js — the StockRwa permission catalog + seed roles.
 *
 * Mirrors the shape served by the Auth/User API (id, name, description,
 * category, active).
 *
 * Note: "stock:in" governs who may receive/record stock-in. The Worker role is
 * seeded WITHOUT it — a shop manager grants it explicitly (roles → Worker →
 * Permissions) to allow a specific worker group to receive stock.
 */
export const PERMISSION_CATEGORIES = ['Products', 'Stock', 'QR', 'Workers', 'Reports', 'Admin']

const p = (id, name, category, description) => ({ id, name, category, description, active: true })

export const DEFAULT_PERMISSIONS = [
  p('perm_products_view', 'products:view', 'Products', 'View the product catalog and product details'),
  p('perm_products_manage', 'products:manage', 'Products', 'Create, edit and archive products'),
  p('perm_products_delete', 'products:delete', 'Products', 'Permanently delete products'),
  p('perm_stock_in', 'stock:in', 'Stock', 'Receive and record stock-in movements'),
  p('perm_stock_out', 'stock:out', 'Stock', 'Issue and record stock-out movements'),
  p('perm_stock_check', 'stock:check', 'Stock', 'Run and view periodic stock checks / counts'),
  p('perm_stock_history', 'stock:history', 'Stock', 'View stock movement history'),
  p('perm_qr_generate', 'qr:generate', 'QR', 'Print QR labels for products'),
  p('perm_qr_scan', 'qr:scan', 'QR', 'Scan product QR codes'),
  p('perm_workers_manage', 'workers:manage', 'Workers', 'Add, edit and deactivate workers and grant stock-in access'),
  p('perm_reports_view', 'reports:view', 'Reports', 'View reports and export summaries'),
  p('perm_admin_users', 'admin:users', 'Admin', 'Manage platform user accounts'),
  p('perm_admin_roles', 'admin:roles', 'Admin', 'Create and edit roles'),
  p('perm_admin_permissions', 'admin:permissions', 'Admin', 'Assign permissions to roles'),
]

export const ADMIN_ONLY_KEYS = ['admin:users', 'admin:roles', 'admin:permissions']

/** Default stack shipped with the app (mirrors constants/roles.js). */
export const SEED_ROLES = [
  {
    id: 1,
    name: 'Super Admin',
    key: 'super_admin',
    description: 'Platform-wide administrator. Full access to the admin portal, users, roles and permissions.',
    method: 'SYSTEM',
    active: true,
    createdAt: new Date().toISOString(),
    permissions: DEFAULT_PERMISSIONS,
  },
  {
    id: 2,
    name: 'Shop Manager',
    key: 'shop_manager',
    description: 'Owns the shop: workers, reports, settings, QR generation and stock-in approval.',
    method: 'SYSTEM',
    active: true,
    createdAt: new Date().toISOString(),
    permissions: DEFAULT_PERMISSIONS.filter((pp) => !ADMIN_ONLY_KEYS.includes(pp.name)),
  },
  {
    id: 3,
    name: 'Worker',
    key: 'worker',
    description: 'Shop-floor stock worker. Records stock-out and scans QR codes. Stock-in must be granted by the manager.',
    method: 'SYSTEM',
    active: true,
    createdAt: new Date().toISOString(),
    permissions: DEFAULT_PERMISSIONS.filter((pp) =>
      ['products:view', 'stock:out', 'stock:check', 'stock:history', 'qr:scan'].includes(pp.name)
    ),
  },
]