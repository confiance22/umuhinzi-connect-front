/**
 * WorkerLayout — phone-first workspace for shop-floor staff. Two big buttons,
 * nothing else: Scan, and My info. The bottom tab bar is a floating "curved
 * dock" — a rounded capsule elevated above the screen edge, so it reads as a
 * premium app shell rather than a generic web nav bar. On desktop it renders
 * as a narrow centered phone column.
 */
import React from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useChat } from '../../hooks/useChat'
import useKbOpen from '../../hooks/useKbOpen'
import { ROUTE_PATHS } from '../../constants/routePaths'

const initialsOf = (name) =>
  (name || 'Worker')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const ScanIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
)

const MeIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
  </svg>
)

const ChatIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
  </svg>
)

const NAV = [
  { to: ROUTE_PATHS.QR_SCAN, label: 'Scan', icon: ScanIcon },
  { to: ROUTE_PATHS.CHAT, label: 'Chat', icon: ChatIcon, chat: true },
  { to: ROUTE_PATHS.ACCOUNT, label: 'My info', icon: MeIcon },
]

/* Keyboard-open state comes from the shared useKbOpen hook (focus-first, so it
   works on every engine — see src/hooks/useKbOpen.js). */

export default function WorkerLayout() {
  const { user, logout } = useAuth()
  const { unread } = useChat()
  const location = useLocation()
  const navigate = useNavigate()

  const isChat = location.pathname === ROUTE_PATHS.CHAT
  const kbOpen = useKbOpen()

  const handleSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`overflow-hidden bg-page text-ink flex flex-col mx-auto w-full relative h-full ${isChat ? '' : 'max-w-[430px] shadow-2xl sm:shadow-none'}`} style={{ height: 'var(--app-height, 100%)' }}>
      {/* ZONE 1 — fixed top header. Never scrolls. */}
      <header className="shrink-0 z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 border-b border-ink/[0.05] px-4 flex items-center gap-3 h-16">
        <span className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-[0_8px_20px_-10px_rgba(16,134,60,0.65)]">
          {initialsOf(user?.name || user?.username)}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-500 ring-2 ring-white" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-sm font-bold text-ink truncate">{user?.name || user?.username || 'Worker'}</p>
          <p className="text-[11px] text-gray-400 truncate flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500" />
            {user?.shopName ? `${user.shopName}` : 'Shop 1 · Kigali'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-danger-600 hover:bg-danger-600/5 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* ZONE 2 — the ONLY scrollable area on screen. Header lives outside it,
    the dock lives outside it, and the chat list scrolls inside it. When the
    keyboard opens this zone shrinks (the shell tracks --app-height) so the
    fixed input above the keyboard is always visible. */}
      <main className={`relative z-10 flex-1 min-h-0 ${isChat ? 'flex flex-col overflow-hidden px-0 py-0' : 'overflow-y-auto overscroll-contain px-4 py-5 pb-8'}`}>
        <Outlet />
      </main>

      {/* ZONE 3 — bottom nav, a NORMAL flex child (not an overlay): it occupies
    its own band, so it can never sit on top of the input field and it can
    never scroll with the chat. While the keyboard is open it is removed from
    layout (hidden) so the input field takes its place directly above the
    keyboard; it reappears automatically when the keyboard closes. */}
      <nav
        className={`shrink-0 relative z-20 transition-opacity duration-200 ${kbOpen ? 'hidden opacity-0' : 'opacity-100'}`}
      >
        <div className="relative w-[calc(100%-1.5rem)] max-w-[400px] mx-auto rounded-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 border border-ink/[0.06] shadow-[0_18px_44px_-18px_rgba(13,13,13,0.4),0_2px_6px_rgba(13,13,13,0.05)] p-1.5 grid grid-cols-3 gap-1.5" style={{ marginBottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}>
          {NAV.map((item) => {
            const isActive = location.pathname === item.to
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-3 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-t from-brand-700 to-brand-500 text-white shadow-[0_10px_24px_-10px_rgba(16,134,60,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] -translate-y-0.5'
                    : 'text-gray-400 hover:text-ink hover:bg-ink/[0.04]'
                }`}
              >
                {item.chat && unread > 0 && (
                  <span className="absolute top-1 right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
                <span className={isActive ? 'scale-110 transition-transform duration-200' : ''}>
                  <Icon />
                </span>
                <span className="text-[11px] font-bold tracking-tight">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}