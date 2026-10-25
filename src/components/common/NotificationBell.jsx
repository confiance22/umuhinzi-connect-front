/**
 * NotificationBell — header dropdown showing a scope's live notifications
 * (system for Super Admin, shop for Shop Manager). Shows unread count badge,
 * "mark all read", click-to-dismiss each item, and exclusive "View all notifications" link.
 */
import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { notificationApi } from '../../api/notificationApi'
import { ROUTE_PATHS } from '../../constants/routePaths'

const TYPE_STYLES = {
  user: 'bg-brand-700/15 text-brand-700',
  team: 'bg-violet-100 text-violet-600',
  shop: 'bg-amber-100 text-amber-600',
  stock: 'bg-emerald-100 text-emerald-600',
  info: 'bg-ink/[0.06] text-ink/60',
}

const TYPE_ICON = {
  user: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 10h-6M19 7v6" />
    </svg>
  ),
  team: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    </svg>
  ),
  shop: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1.5-4h15L21 9M4 9v11h16V9M4 9h16M9 20v-6h6v6" />
    </svg>
  ),
  stock: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
}

const BellIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

export default function NotificationBell({ scope = 'system' }) {
  const { items, unread, markRead, markAllRead } = useNotifications(scope)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const fullPageHref =
    scope === 'system' ? ROUTE_PATHS.ADMIN_NOTIFICATIONS : ROUTE_PATHS.NOTIFICATIONS

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-ink hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
      >
        {BellIcon}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card rounded-2xl shadow-soft border border-line overflow-hidden z-50 animate-[fadeIn_0.15s_ease]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-ink">
              {scope === 'system' ? 'System notifications' : 'Shop notifications'}
            </p>
            {unread > 0 ? (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                Mark all read
              </button>
            ) : (
              <span className="text-xs font-medium text-gray-400">All caught up</span>
            )}
          </div>

          <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-400">No notifications yet.</div>
            ) : (
              items.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-page transition-colors ${
                    n.read ? 'opacity-60' : ''
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      TYPE_STYLES[n.type] || TYPE_STYLES.info
                    }`}
                  >
                    {TYPE_ICON[n.type] || TYPE_ICON.info}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink leading-snug">{n.title}</p>
                    <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 pt-0.5">
                    {notificationApi.timeAgo(n.time)}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* ── Direct link to full Notifications page ── */}
          <div className="p-2.5 border-t border-gray-100 bg-gray-50/70">
            <Link
              to={fullPageHref}
              onClick={() => setOpen(false)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
            >
              <span>View all notifications</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}