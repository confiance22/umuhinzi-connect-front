/**
 * permissions.js — Umuhinzi Connect permission catalog.
 *
 * Mirrors the keys seeded by the backend. The admin UI groups permissions by
 * these categories when editing farmer and buyer access.
 */
export const PERMISSION_CATEGORIES = ['Platform', 'Users', 'Access', 'Marketplace']

const p = (id, name, category, description) => ({ id, name, category, description, active: true })

export const DEFAULT_PERMISSIONS = [
  p('perm_platform_view', 'platform:view', 'Platform', 'View the platform overview'),
  p('perm_users_view', 'users:view', 'Users', 'View user accounts'),
  p('perm_users_create', 'users:create', 'Users', 'Create user accounts'),
  p('perm_users_update', 'users:update', 'Users', 'Edit user accounts'),
  p('perm_users_status', 'users:status', 'Users', 'Enable, disable and lock accounts'),
  p('perm_users_delete', 'users:delete', 'Users', 'Delete user accounts'),
  p('perm_roles_view', 'roles:view', 'Access', 'View roles'),
  p('perm_roles_manage', 'roles:manage', 'Access', 'Create and edit roles'),
  p('perm_permissions_view', 'permissions:view', 'Access', 'View permissions'),
  p('perm_harvests_view', 'harvests:view', 'Marketplace', 'View harvest listings'),
  p('perm_harvests_manage_own', 'harvests:manage_own', 'Marketplace', 'Manage own harvest listings'),
  p('perm_harvests_moderate', 'harvests:moderate', 'Marketplace', 'Moderate harvest listings'),
  p('perm_requests_create', 'requests:create', 'Marketplace', 'Create buyer requests'),
  p('perm_requests_manage_own', 'requests:manage_own', 'Marketplace', 'Manage own buyer requests'),
  p('perm_requests_view', 'requests:view', 'Marketplace', 'View buyer requests'),
  p('perm_messages_send', 'messages:send', 'Marketplace', 'Send messages'),
  p('perm_messages_view', 'messages:view', 'Marketplace', 'View conversations'),
]

export const ADMIN_ONLY_KEYS = [
  'platform:view',
  'users:view',
  'users:create',
  'users:update',
  'users:status',
  'users:delete',
  'roles:view',
  'roles:manage',
  'permissions:view',
]

export const FARMER_DEFAULT_KEYS = ['harvests:view', 'harvests:manage_own', 'requests:view']
export const BUYER_DEFAULT_KEYS = ['harvests:view', 'requests:create', 'requests:manage_own']

/** Default access stack (mirrors the backend seed). */
export const SEED_ROLES = [
  {
    id: 'seed-super-admin',
    name: 'Super Admin',
    key: 'super_admin',
    description: 'Platform administrator with full access to users, roles and permissions.',
    active: true,
    permissions: DEFAULT_PERMISSIONS,
  },
  {
    id: 'seed-farmer',
    name: 'Farmer',
    key: 'farmer',
    description: 'Lists harvests and connects with buyers.',
    active: true,
    permissions: DEFAULT_PERMISSIONS.filter((pp) => FARMER_DEFAULT_KEYS.includes(pp.name)),
  },
  {
    id: 'seed-buyer',
    name: 'Buyer',
    key: 'buyer',
    description: 'Discovers harvests, posts requests and contacts farmers.',
    active: true,
    permissions: DEFAULT_PERMISSIONS.filter((pp) => BUYER_DEFAULT_KEYS.includes(pp.name)),
  },
]
