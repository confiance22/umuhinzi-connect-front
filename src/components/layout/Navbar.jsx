/**
 * Navbar — top bar of the app shell.
 * Shows shop name, the logged-in user + RoleBadge, and a logout action
 * (AuthContext.logout). Workers see their own name so stock actions they make
 * are attributable.
 */
import { useAuth } from '../../hooks/useAuth'
import RoleBadge from '../workers/RoleBadge'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <header className="flex h-14 items-center justify-between border-b border-line bg-white px-6">
      <div className="text-sm font-semibold text-ink truncate">{user?.shopName ?? 'My shop'}</div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 text-sm text-ink">
            <span>{user.name}</span>
            <RoleBadge role={user.role} />
          </div>
        )}
        <button
          className="text-sm text-gray-500 hover:text-danger-600"
          onClick={logout}
          aria-label="Sign out"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}