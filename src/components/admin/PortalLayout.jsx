/**
 * PortalLayout — shared admin portal shell. Dark collapsible sidebar with the
 * Umuhinzi Connect lockup, mobile drawer, sticky header, toast container and
 * profile dropdown. Differences between portals are purely props:
 *
 *   <PortalLayout subtitle brandSubtitle overview sections accountPath />
 */
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import BrandLockup from '../common/Brand'
import NotificationBell from '../common/NotificationBell'
import LanguageToggle from '../public/LanguageToggle'
import Toast from '../common/Toast'
import { useToastContext } from '../../context/ToastContext'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'

const ICONS = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </>
  ),
  customers: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </>
  ),
  roles: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  permissions: (
    <>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M11 12l6-6 3 3-6 6" />
      <path d="M14 9l3 3" />
    </>
  ),
  shop: (
    <>
      <path d="M3 9l1.5-4h15L21 9" />
      <path d="M4 9v11h16V9" />
      <path d="M4 9h16" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  box: (
    <>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  stockIn: (
    <>
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  stockOut: (
    <>
      <path d="M12 15V3" />
      <path d="m8 7 4-4 4 4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  stockCheck: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM14 21h3v-3M21 14h-1M21 19h.01" />
    </>
  ),
  scan: (
    <>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </>
  ),
  reports: (
    <>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </>
  ),
  settings: (
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  chat: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>
  ),
}

const Icon = ({ name, className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {ICONS[name]}
  </svg>
)

const isPathActive = (pathname, to, allItems = []) => {
  if (pathname === to) return true
  // If another item is an exact match for pathname, this item is not active
  const hasExactSibling = allItems.some((item) => item.to === pathname)
  if (hasExactSibling) return false
  return pathname.startsWith(`${to}/`)
}

const initialsOf = (name) =>
  (name || 'User')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const shortNameOf = (name) => (name || 'Admin').split(/[\s@]+/).filter(Boolean)[0] || 'Admin'

export const PortalLayout = ({
  subtitle = 'Portal',
  breadcrumbLabel = 'Rwanda · Portal',
  overview = { label: 'Overview', to: '/dashboard', icon: 'overview' },
  sections = [],
  accountPath = null,
  extraTitles = {},
  notificationScope = 'system',
  showNotifications = true,
}) => {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const { toasts, dismissToast } = useToastContext()
  const location = useLocation()
  const navigate = useNavigate()
  const themeRef = useRef(theme)

  useLayoutEffect(() => {
    themeRef.current = theme
  }, [theme])

  useLayoutEffect(() => {
    const root = document.documentElement

    const lockLight = () => {
      if (root.classList.contains('dark')) root.classList.remove('dark')
      if (root.style.colorScheme !== 'light') root.style.colorScheme = 'light'
    }

    lockLight()
    const observer = new MutationObserver(lockLight)
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'style'] })

    return () => {
      observer.disconnect()
      root.classList.toggle('dark', themeRef.current === 'dark')
      root.style.colorScheme = themeRef.current
    }
  }, [])

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const allItems = sections.flatMap((s) => s.items)

  const [expandedSections, setExpandedSections] = useState(() => {
    const activeSection = sections.find((s) => s.items.some((i) => isPathActive(location.pathname, i.to)))
    const initial = {}
    sections.forEach((s) => {
      initial[s.id] = s.id === activeSection?.id
    })
    return initial
  })

  const toggleSection = (id) => {
    if (collapsed && !mobileOpen) {
      setCollapsed(false)
      setExpandedSections(() => {
        const next = {}
        sections.forEach((s) => {
          next[s.id] = s.id === id
        })
        return next
      })
    } else {
      setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))
    }
  }

  const activeItem =
    location.pathname === overview.to ? overview : allItems.find((i) => i.to === location.pathname)
  const pageTitle = activeItem?.label || extraTitles[location.pathname] || 'Admin'

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const owner = sections.find((s) => s.items.some((i) => isPathActive(location.pathname, i.to)))
    if (owner) {
      setExpandedSections((prev) => (prev[owner.id] ? prev : { ...prev, [owner.id]: true }))
    }
  }, [location.pathname, sections])

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const sidebarFooter = (
    <div className="shrink-0 p-3">
      {collapsed && !mobileOpen ? (
        <Link
          to="/"
          title={t('portal.backToSite')}
          className="flex items-center justify-center rounded-xl border border-white/10 bg-ink p-2.5 text-white/60 transition-colors hover:bg-brand-600/20 hover:text-white"
        >
          <Icon name="globe" className="h-4 w-4" />
        </Link>
      ) : (
        <div className="rounded-xl border border-white/10 bg-ink p-2 shadow-lg shadow-black/20">
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-white/65 transition-colors hover:bg-brand-600/15 hover:text-white"
          >
            <Icon name="globe" className="h-3.5 w-3.5 text-brand-400" />
            <span>{t('portal.backToSite')}</span>
            <svg
              className="ml-auto h-3 w-3 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <div className="mx-2 my-1 h-px bg-white/[0.06]" />

          <div className="px-2 pb-0.5 pt-1">
            <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-brand-400/70">{t('portal.explore')}</p>
            <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1">
              <Link to="/harvests" className="text-[10px] font-medium text-white/40 transition-colors hover:text-brand-300">
                {t('portal.marketplace')}
              </Link>
              <Link to="/market-prices" className="text-[10px] font-medium text-white/40 transition-colors hover:text-brand-300">
                {t('portal.prices')}
              </Link>
              <Link to="/contact" className="text-[10px] font-medium text-white/40 transition-colors hover:text-brand-300">
                {t('portal.support')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const sidebarInner = (
    <>
      <div
        className={`pt-5 pb-3 shrink-0 ${
          collapsed && !mobileOpen ? 'flex justify-center px-0' : 'px-5'
        }`}
      >
        <BrandLockup
          hideText={collapsed && !mobileOpen}
          bold
          size={30}
          textClassName="text-[15px]"
        />
        {!(collapsed && !mobileOpen) && (
          <p className="mt-2 ml-[48px] text-xs font-bold text-brand-400 uppercase tracking-[0.14em]">
            {subtitle}
          </p>
        )}
      </div>

      <nav className="relative flex-1 overflow-y-auto px-3.5 py-2 space-y-1.5 admin-scroll">
        <NavLink
          to={overview.to}
          title={collapsed && !mobileOpen ? overview.label : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200 ${
              collapsed && !mobileOpen ? 'lg:justify-center' : ''
            } ${
              isActive
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                : 'text-white/60 hover:text-white hover:bg-brand-600/20'
            }`
          }
        >
          <Icon name={overview.icon} className="w-5 h-5 shrink-0" />
          {!(collapsed && !mobileOpen) && <span className="truncate text-sm font-medium">{overview.label}</span>}
        </NavLink>

        {sections.map((section) => {
          const expanded = expandedSections[section.id]
          const anyChildActive = section.items.some((i) => isPathActive(location.pathname, i.to))
          const railMode = collapsed && !mobileOpen
          return (
            <div key={section.id}>
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                title={railMode ? section.title : undefined}
                className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  railMode ? 'lg:justify-center' : 'justify-between'
                } ${
                  railMode
                    ? anyChildActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                      : 'text-white/60 hover:text-white hover:bg-brand-600/20'
                    : section.highlight && anyChildActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                    : expanded
                    ? 'text-white bg-brand-600/15'
                    : 'text-white/60 hover:text-white hover:bg-brand-600/20'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon name={section.icon} className="w-5 h-5 shrink-0" />
                  {!railMode && <span className="truncate text-sm font-medium">{section.title}</span>}
                </span>
                {!railMode && (
                  <svg
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${expanded ? 'rotate-180' : ''} ${
                      section.highlight && anyChildActive ? 'text-white/80' : expanded ? 'text-brand-400' : 'text-white/30'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expanded && !railMode ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="ml-[24px] pl-3.5 border-l border-brand-600/30 space-y-0.5 py-0.5">
                  {section.items.map((item) => {
                    const active = isPathActive(location.pathname, item.to, allItems)
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                          active
                            ? 'bg-brand-600 text-white font-medium shadow-md shadow-brand-600/25'
                            : 'text-white/50 hover:text-white hover:bg-brand-600/20 font-normal'
                        }`}
                      >
                        <Icon name={item.icon} className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {typeof item.badge === 'number' && item.badge > 0 && (
                          <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </nav>

      {sidebarFooter}
    </>
  )

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-page text-ink antialiased font-sans dark:bg-[#07100a] dark:text-[#f3f0e6]">
      {mobileOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside
        className={`portal-sidebar hidden lg:flex flex-col shrink-0 relative overflow-hidden border-r border-white/[0.06] lg:sticky lg:top-0 lg:h-screen transition-all duration-300 ${
          collapsed ? 'lg:w-[84px]' : 'lg:w-72'
        }`}
      >
        {sidebarInner}
      </aside>

      {mobileOpen && (
        <aside className="portal-sidebar fixed inset-0 z-[100] lg:hidden flex flex-col overflow-hidden overflow-y-auto">
          <div className="px-5 pt-5 pb-3 shrink-0">
            <div className="flex items-center justify-between">
              <BrandLockup bold size={30} textClassName="text-[15px]" />
              <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white p-1" aria-label="Close menu">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="mt-2 ml-[48px] text-xs font-bold text-brand-400 uppercase tracking-[0.14em]">{subtitle}</p>
          </div>

          <nav className="relative flex-1 overflow-y-auto px-3.5 py-2 space-y-1.5 admin-scroll">
            <NavLink
              to={overview.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200 ${
                  isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'text-white/60 hover:text-white hover:bg-brand-600/20'
                }`
              }
            >
              <Icon name={overview.icon} className="w-5 h-5 shrink-0" />
              <span className="truncate text-sm font-medium">{overview.label}</span>
            </NavLink>

            {sections.map((section) => {
              const expanded = expandedSections[section.id]
              const anyChildActive = section.items.some((i) => isPathActive(location.pathname, i.to))
              return (
                <div key={section.id}>
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      expanded || anyChildActive
                        ? section.highlight && anyChildActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                          : 'text-white bg-brand-600/15'
                        : 'text-white/60 hover:text-white hover:bg-brand-600/20'
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon name={section.icon} className="w-5 h-5 shrink-0" />
                      <span className="truncate text-sm font-medium">{section.title}</span>
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${expanded ? 'rotate-180' : ''} ${
                        section.highlight && anyChildActive ? 'text-white/80' : expanded ? 'text-brand-400' : 'text-white/30'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                    <div className="ml-[24px] pl-3.5 border-l border-brand-600/30 space-y-0.5 py-0.5">
                      {section.items.map((item) => {
                        const active = isPathActive(location.pathname, item.to, allItems)
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                              active
                                ? 'bg-brand-600 text-white font-medium shadow-md shadow-brand-600/25'
                                : 'text-white/50 hover:text-white hover:bg-brand-600/20 font-normal'
                            }`}
                          >
                            <Icon name={item.icon} className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </NavLink>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>

          {sidebarFooter}
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-[72px] shrink-0 bg-page border-b border-line flex items-center gap-4 px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-500 hover:text-ink p-1" aria-label="Open menu">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:flex text-gray-400 hover:text-ink hover:bg-page w-9 h-9 rounded-lg items-center justify-center transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>

          <div className="hidden sm:block min-w-0">
            <p className="text-xs font-medium text-gray-400">{breadcrumbLabel}</p>
            <h1 key={pageTitle} className="text-sm font-semibold text-ink leading-tight truncate animate-[fadeIn_0.3s_ease]">
              {pageTitle}
            </h1>
          </div>

          <div className="flex-1" />

          <LanguageToggle
            compact
            className="border-line bg-page text-ink/70 hover:border-brand-500/40 hover:text-brand-600"
          />

          {showNotifications && <NotificationBell scope={notificationScope} />}

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              title={user?.name || user?.username || 'Admin'}
              className="group flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-page transition-colors"
            >
              <span className="w-9 h-9 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center group-hover:ring-4 group-hover:ring-brand-600/40 transition-all duration-200">
                {initialsOf(user?.name || user?.username)}
              </span>
              <p className="hidden sm:block text-sm font-semibold text-ink leading-tight max-w-[100px] truncate">
                {shortNameOf(user?.name || user?.username)}
              </p>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-line bg-card shadow-soft p-2 z-50 animate-[fadeIn_0.15s_ease]">
                <div className="px-3 py-2.5 border-b border-line flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {initialsOf(user?.name || user?.username)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{user?.name || user?.username}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email || '—'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {accountPath && (
                    <>
                      <button
                        onClick={() => {
                          setProfileOpen(false)
                          navigate(`${accountPath}?tab=overview`)
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm text-muted hover:text-ink hover:bg-page rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        {t('portal.myProfile')}
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false)
                          navigate(`${accountPath}?tab=password`)
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm text-muted hover:text-ink hover:bg-page rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        {t('portal.changePassword')}
                      </button>
                      <div className="my-1.5 border-t border-line" />
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm text-danger-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
                    </svg>
                    {t('portal.signOut')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="w-full flex-1 min-w-0">
          <div key={location.pathname} className="max-w-[2100px] mx-auto w-full p-4 sm:p-6 lg:p-8 animate-[fadeIn_0.3s_ease]">
            <Outlet />
          </div>
        </main>
      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default PortalLayout