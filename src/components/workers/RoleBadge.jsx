/**
 * RoleBadge — colored pill for a user role (super_admin / shop_manager / worker).
 * Uses constants/roles.js ROLE_LABELS for display text.
 */
import Badge from '../common/Badge'
import { ROLE_LABELS } from '../../constants/roles'

const ROLE_TONE = { super_admin: 'brand', shop_manager: 'amber', worker: 'gray' }

export default function RoleBadge({ role }) {
  return <Badge tone={ROLE_TONE[role] ?? 'gray'}>{ROLE_LABELS[role] ?? role}</Badge>
}