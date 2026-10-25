/**
 * roles.js — supported roles in StockRwa.
 *
 * SUPER_ADMIN  — platform-wide administrator. The only role that can open the
 *                Admin portal (/admin/*) to manage users, roles and permissions.
 * SHOP_MANAGER — full access inside a shop: workers, reports, settings, QR
 *                generation and stock-in approval. (Formerly "owner".)
 * WORKER       — shop-floor stock worker: products + stock-out + QR scanning.
 *                Stock-in is blocked by default unless the manager grants the
 *                role the `stock:in` permission (see topics: theft risk).
 *
 * Role drives route guards (routes/ProtectedRoute.jsx, utils/permissionHelpers.js)
 * and UI affordances (hide manager/super-admin-only links/buttons).
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  SHOP_MANAGER: 'shop_manager',
  WORKER: 'worker',
}

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.SHOP_MANAGER]: 'Shop Manager',
  [ROLES.WORKER]: 'Worker',
}

export const OWNER_ONLY_ROUTES = {
  WORKERS: true,
  REPORTS: true,
  SETTINGS: true,
}