/**
 * routePaths.js — single source of truth for app paths.
 * Use these constants everywhere (Routes, Link, useNavigate) so links never
 * drift. Function helpers accept an id (default ':id' for route definitions).
 */
export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',

  PRODUCTS: '/products',
  PRODUCT_ADD: '/products/add',
  PRODUCT_EDIT: (id = ':id') => `/products/${id}/edit`,
  PRODUCT_DETAIL: (id = ':id') => `/products/${id}`,

  STOCK_IN: '/stock/in',
  STOCK_OUT: '/stock/out',
  STOCK_CHECK: '/stock/check',

  CUSTOMERS: '/customers',

  QR_GENERATE: '/qr/generate',
  QR_SCAN: '/qr/scan',

  WORKERS: '/workers',
  REPORTS: '/reports',
  REPORTS_STOCK_IN: '/reports/stock-in',
  REPORTS_STOCK_OUT: '/reports/stock-out',
  REPORTS_PRODUCTS: '/reports/products',
  SETTINGS: '/settings',
  SETTINGS_SHOP: '/settings/shop',
  SETTINGS_INVENTORY: '/settings/inventory',
  SETTINGS_SECURITY: '/settings/security',
  ACCOUNT: '/account',
  NOTIFICATIONS: '/notifications',
  CHAT: '/chat',

  // Admin portal (super admins only)
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_PERMISSIONS: '/admin/permissions',
  ADMIN_ACCOUNT: '/admin/account',
  ADMIN_SHOPS: '/admin/shops',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_CHAT: '/admin/chat',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_SETTINGS_SECURITY: '/admin/settings/security',
  ADMIN_SETTINGS_SHOPS: '/admin/settings/shops',
  ADMIN_SETTINGS_PRODUCTS: '/admin/settings/products',
}