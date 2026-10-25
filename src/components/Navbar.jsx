import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { roleHome, roleLabel } from '../utils/roles'
import BrandLockup from './common/Brand'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? 'text-brand-700' : 'text-ink/70 hover:text-brand-700'
  }`

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthContext()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center" aria-label="Umuhinzi Connect home">
          <BrandLockup dark size={32} textClassName="text-[15px]" />
        </Link>

        <nav className="flex flex-wrap items-center gap-4">
          <NavLink to="/" className={navLinkClass} end>
            Browse
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to={roleHome(user.role)} className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/messages" className={navLinkClass}>
                Messages
              </NavLink>
              <span className="hidden items-center gap-2 sm:flex">
                <span className="text-sm text-muted">{user.full_name}</span>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">
                  {roleLabel(user.role)}
                </span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-card border border-line px-3 py-1.5 text-sm font-medium text-ink/70 transition hover:border-danger-600/30 hover:text-danger-600"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Sign in
              </NavLink>
              <Link
                to="/register"
                className="rounded-card bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
