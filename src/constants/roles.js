/**
 * roles.js — supported Umuhinzi Connect roles.
 *
 * SUPER_ADMIN — platform administrator. The only role that can open the admin
 *               portal to manage users, roles and permissions.
 * FARMER      — manages their own harvest listings and buyer conversations.
 * BUYER       — discovers harvests, posts requests and contacts farmers.
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  FARMER: 'farmer',
  BUYER: 'buyer',
  // Kept so older, unrouted portal modules still compile.
  SHOP_MANAGER: 'shop_manager',
  WORKER: 'worker',
}

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.FARMER]: 'Farmer',
  [ROLES.BUYER]: 'Buyer',
  [ROLES.SHOP_MANAGER]: 'Shop Manager',
  [ROLES.WORKER]: 'Worker',
}

export const OWNER_ONLY_ROUTES = {
  USERS: true,
  ROLES: true,
  PERMISSIONS: true,
}
