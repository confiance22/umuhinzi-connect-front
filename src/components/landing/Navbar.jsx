import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LayoutDashboard, LogOut, Menu, Route as RouteIcon, ShoppingBasket, Sprout, X } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { BrandMark } from '../common/Brand'
import ThemeToggle from '../public/ThemeToggle'
import LanguageToggle from '../public/LanguageToggle'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import { useAuthContext } from '../../context/AuthContext'
import { roleHome, roleLabel } from '../../utils/roles'

const primaryLinks = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/harvests', key: 'nav.harvests' }
]

const secondaryLinks = [
  { to: '/market-prices', key: 'nav.marketPrices' },
  { to: '/about', key: 'nav.about' },
  { to: '/contact', key: 'nav.contact' }
]

const platformLinks = [
  {
    to: '/platform/how-it-works',
    key: 'nav.howItWorks',
    descKey: 'nav.howItWorksDesc',
    icon: RouteIcon
  },
  {
    to: '/platform/farmers',
    key: 'nav.forFarmers',
    descKey: 'nav.forFarmersDesc',
    icon: Sprout
  },
  {
    to: '/platform/buyers',
    key: 'nav.forBuyers',
    descKey: 'nav.forBuyersDesc',
    icon: ShoppingBasket
  }
]

const publicPaths = new Set([
  '/',
  '/harvests',
  '/market-prices',
  '/how-it-works',
  '/about',
  '/contact'
])

const isPublicPath = (pathname) =>
  publicPaths.has(pathname) || pathname.startsWith('/platform/')

const isPlatformPath = (pathname) =>
  pathname.startsWith('/platform/') || pathname === '/how-it-works'

export default function Navbar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [mobilePlatformOpen, setMobilePlatformOpen] = useState(false)
  const [platformOpen, setPlatformOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [overHero, setOverHero] = useState(isPublicPath(location.pathname))
  const platformRef = useRef(null)
  const userMenuRef = useRef(null)
  const hoverTimer = useRef(null)
  const { isDark } = useTheme()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user, isAuthenticated, isInitialized, logout } = useAuthContext()

  const displayName = user?.full_name || user?.name || user?.phone || t('common.signedInAs')
  const shortName = displayName.split(/[\s_.-]+/).filter(Boolean)[0] || displayName
  const initials = displayName
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = () => {
    logout()
    closeAll()
    navigate('/')
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (!isOpen) setMobilePlatformOpen(false)
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
    setPlatformOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (scrolled) {
      setIsOpen(false)
      setPlatformOpen(false)
      setUserMenuOpen(false)
    }
  }, [scrolled])

  useEffect(() => {
    if (!platformOpen) return undefined

    const handlePointerDown = (event) => {
      if (platformRef.current && !platformRef.current.contains(event.target)) {
        setPlatformOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setPlatformOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [platformOpen])

  useEffect(() => {
    if (!userMenuOpen) return undefined

    const handlePointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setUserMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [userMenuOpen])

  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
    },
    []
  )

  useEffect(() => {
    const updateNav = () => {
      setScrolled(window.scrollY > 0)

      if (!isPublicPath(location.pathname)) {
        setOverHero(false)
        return
      }

      const hero = document.querySelector('[data-hero]')
      const threshold = (hero?.offsetHeight ?? 640) - 76
      setOverHero(window.scrollY < threshold)
    }

    updateNav()
    window.addEventListener('scroll', updateNav, { passive: true })
    window.addEventListener('resize', updateNav)
    return () => {
      window.removeEventListener('scroll', updateNav)
      window.removeEventListener('resize', updateNav)
    }
  }, [location.pathname])

  const openPlatform = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setPlatformOpen(true)
  }

  const closePlatformSoon = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setPlatformOpen(false), 140)
  }

  const closeAll = () => {
    setIsOpen(false)
    setPlatformOpen(false)
    setUserMenuOpen(false)
    setMobilePlatformOpen(false)
  }

  const onDark = isDark
  const floating = overHero && !scrolled
  const strongText = onDark ? 'text-white' : 'text-[#052e16]'
  const softText = onDark
    ? 'text-white/65 hover:text-white'
    : 'text-[#052e16]/60 hover:text-[#052e16]'
  const activeText = onDark ? 'text-white' : 'text-[#052e16]'
  const underline = onDark ? 'bg-white' : 'bg-brand-600'
  const divider = onDark ? 'bg-white/15' : 'bg-black/10'
  const platformActive = isPlatformPath(location.pathname)
  const toggleTone = onDark
    ? '!border-white/15 !bg-white/10 !text-white hover:!border-white/30 hover:!bg-white/15'
    : ''

  const mobileLinkClass = (isActive) =>
    `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-600 text-white'
        : onDark
          ? 'text-white/75 hover:bg-white/5 hover:text-white'
          : 'text-[#052e16]/65 hover:bg-brand-50 hover:text-brand-700'
    }`

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[1000] border-b transition-all duration-500 ${
        floating
          ? 'border-black/5 bg-transparent dark:border-white/10'
          : `backdrop-blur-xl ${
              isDark
                ? 'border-white/10 bg-[#050505]/90'
                : 'border-black/5 bg-[#f6f1e6]/90'
            } shadow-[0_10px_40px_-24px_rgba(5,46,22,0.35)]`
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-3 px-4 py-3 lg:px-8 lg:py-3.5">
        <Link to="/" aria-label="Umuhinzi Connect home" className="group flex shrink-0 items-center gap-2.5">
          <BrandMark
            size={30}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <span
            className={`hidden text-[15px] font-semibold tracking-[-0.02em] sm:inline ${strongText}`}
          >
            Umuhinzi <span className={onDark ? 'text-brand-300' : 'text-brand-600'}>Connect</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-3 lg:flex xl:gap-7" aria-label="Primary navigation">
          {primaryLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className="group relative py-2 text-[12px] font-medium transition-colors duration-300 xl:text-[13px]"
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? activeText : softText}>{t(link.key)}</span>
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px rounded-full transition-all duration-300 ${underline} ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}

          <div
            ref={platformRef}
            className="relative"
            onMouseEnter={openPlatform}
            onMouseLeave={closePlatformSoon}
          >
            <button
              type="button"
              onClick={() => setPlatformOpen((open) => !open)}
              aria-expanded={platformOpen}
              aria-haspopup="true"
              className="group relative flex items-center gap-1 py-2 text-[12px] font-medium transition-colors duration-300 xl:text-[13px]"
            >
              <span className={platformActive ? activeText : softText}>{t('nav.platform')}</span>
              <ChevronDown
                className={`size-3 transition-transform duration-300 ${
                  platformOpen ? 'rotate-180' : ''
                } ${platformActive ? activeText : softText}`}
              />
              <span
                className={`absolute -bottom-0.5 left-0 h-px rounded-full transition-all duration-300 ${underline} ${
                  platformActive || platformOpen ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </button>

            <AnimatePresence>
              {platformOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-1/2 top-full z-50 w-[320px] -translate-x-1/2 pt-3"
                >
                  <div
                    className={`overflow-hidden rounded-[22px] border p-2 backdrop-blur-2xl ${
                      isDark
                        ? 'border-white/10 bg-[#07100a]/95 text-white shadow-[0_32px_80px_-32px_rgba(0,0,0,0.75)]'
                        : 'border-black/5 bg-[#fbf7ec]/95 text-[#13251a] shadow-[0_32px_80px_-32px_rgba(15,61,37,0.38)]'
                    }`}
                  >
                    <p
                      className={`px-3 pb-2 pt-1.5 text-[7px] font-semibold uppercase tracking-[0.18em] ${
                        isDark ? 'text-white/30' : 'text-[#13251a]/35'
                      }`}
                    >
                      {t('nav.platform')}
                    </p>

                    {platformLinks.map((item) => {
                      const Icon = item.icon
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setPlatformOpen(false)}
                          className={({ isActive }) =>
                            `group/item flex items-center gap-3 rounded-[14px] p-2.5 transition-colors ${
                              isActive
                                ? isDark
                                  ? 'bg-[#d9f99d]/10'
                                  : 'bg-[#e7efda]'
                                : isDark
                                  ? 'hover:bg-white/[0.06]'
                                  : 'hover:bg-[#0f3d25]/[0.045]'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <span
                                className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                                  isActive
                                    ? 'bg-[#0f3d25] text-[#d9f99d] dark:bg-[#d9f99d] dark:text-[#0f3d25]'
                                    : isDark
                                      ? 'bg-white/[0.06] text-white/55'
                                      : 'bg-[#0f3d25]/[0.06] text-[#0f3d25]/55'
                                }`}
                              >
                                <Icon className="size-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5 text-[12px] font-semibold">
                                  {t(item.key)}
                                  {isActive && (
                                    <span className="size-1.5 rounded-full bg-brand-500 dark:bg-[#d9f99d]" />
                                  )}
                                </span>
                                <span
                                  className={`mt-0.5 block text-[9px] leading-relaxed ${
                                    isDark ? 'text-white/35' : 'text-[#13251a]/45'
                                  }`}
                                >
                                  {t(item.descKey)}
                                </span>
                              </span>
                            </>
                          )}
                        </NavLink>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {secondaryLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="group relative py-2 text-[12px] font-medium transition-colors duration-300 xl:text-[13px]"
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? activeText : softText}>{t(link.key)}</span>
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px rounded-full transition-all duration-300 ${underline} ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex xl:gap-2">
          <LanguageToggle className={toggleTone} />
          <ThemeToggle className={toggleTone} />
          <span className={`mx-1 h-5 w-px ${divider}`} />
          {isInitialized ? (
            isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 transition-colors duration-300 ${
                    onDark
                      ? 'border-white/15 bg-white/10 text-white hover:border-white/30'
                      : 'border-black/10 bg-black/[0.03] text-[#052e16] hover:border-black/20'
                  }`}
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white">
                    {initials || 'UC'}
                  </span>
                  <span className="whitespace-nowrap text-[10px] font-semibold leading-none">
                    {shortName}
                  </span>
                  <ChevronDown
                    className={`size-3 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''} ${
                      onDark ? 'text-white/50' : 'text-[#052e16]/45'
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-full z-50 w-[240px] pt-2"
                    >
                      <div
                        className={`overflow-hidden rounded-[18px] border p-1.5 backdrop-blur-2xl ${
                          isDark
                            ? 'border-white/10 bg-[#07100a]/95 text-white shadow-[0_32px_80px_-32px_rgba(0,0,0,0.75)]'
                            : 'border-black/5 bg-[#fbf7ec]/95 text-[#13251a] shadow-[0_32px_80px_-32px_rgba(15,61,37,0.38)]'
                        }`}
                        role="menu"
                      >
                        <div className="flex items-center gap-2.5 px-2.5 py-2">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
                            {initials || 'UC'}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block whitespace-nowrap text-[11px] font-semibold leading-tight">{displayName}</span>
                            <span
                              className={`mt-0.5 block text-[9px] font-bold uppercase tracking-[0.14em] ${
                                isDark ? 'text-brand-300' : 'text-brand-700'
                              }`}
                            >
                              {roleLabel(user.role)}
                            </span>
                          </span>
                        </div>

                        <div className={`mx-1 my-1 h-px ${divider}`} />

                        <Link
                          to={roleHome(user.role)}
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-2.5 rounded-[12px] px-2.5 py-2.5 text-[12px] font-medium transition-colors ${
                            isDark
                              ? 'text-white/75 hover:bg-white/[0.06] hover:text-white'
                              : 'text-[#13251a]/70 hover:bg-[#0f3d25]/[0.045] hover:text-[#13251a]'
                          }`}
                          role="menuitem"
                        >
                          <LayoutDashboard className="size-4" />
                          {t('common.dashboard')}
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className={`flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2.5 text-left text-[12px] font-medium transition-colors ${
                            isDark
                              ? 'text-rose-300 hover:bg-rose-500/10'
                              : 'text-rose-600 hover:bg-rose-50'
                          }`}
                          role="menuitem"
                        >
                          <LogOut className="size-4" />
                          {t('common.signOut')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`rounded-full px-3 py-2 text-[12px] font-medium transition-colors duration-300 xl:text-[13px] ${
                    onDark ? 'text-white/75 hover:text-white' : 'text-[#052e16]/65 hover:text-[#052e16]'
                  }`}
                >
                  {t('common.signIn')}
                </Link>
                <Link
                  to="/register"
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-[12px] font-semibold transition-all duration-300 active:scale-[0.98] xl:text-[13px] ${
                    onDark
                      ? 'bg-white text-[#052e16] shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:bg-brand-50'
                      : 'bg-brand-600 text-white shadow-[0_10px_30px_-12px_rgba(22,163,74,0.7)] hover:bg-brand-700'
                  }`}
                >
                  {t('common.getStarted')}
                </Link>
              </>
            )
          ) : null}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle className={toggleTone} />
          <ThemeToggle className={toggleTone} />
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? t('common.closeMenu') : t('common.openMenu')}
            aria-expanded={isOpen}
            aria-controls="public-mobile-menu"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-300 ${
              onDark ? 'text-white hover:bg-white/10' : 'text-[#052e16] hover:bg-black/5'
            }`}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            id="public-mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`absolute inset-x-0 top-full max-h-[calc(100vh-64px)] overflow-y-auto border-b lg:hidden ${
              onDark ? 'border-white/10 bg-[#06140c]' : 'border-black/5 bg-white'
            }`}
            aria-label="Mobile navigation"
          >
            <div className="mx-auto max-w-[1180px] px-4 py-4">
              <div className="flex flex-col gap-1">
                {primaryLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={closeAll}
                    className={({ isActive }) => mobileLinkClass(isActive)}
                  >
                    {t(link.key)}
                  </NavLink>
                ))}

                <div>
                  <button
                    type="button"
                    onClick={() => setMobilePlatformOpen((open) => !open)}
                    aria-expanded={mobilePlatformOpen}
                    aria-controls="public-platform-mobile"
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      platformActive
                        ? 'bg-brand-600 text-white'
                        : onDark
                          ? 'text-white/75 hover:bg-white/5 hover:text-white'
                          : 'text-[#052e16]/65 hover:bg-brand-50 hover:text-brand-700'
                    }`}
                  >
                    {t('nav.platform')}
                    <ChevronDown
                      className={`size-4 transition-transform duration-300 ${
                        mobilePlatformOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {mobilePlatformOpen && (
                      <motion.div
                        id="public-platform-mobile"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div
                          className={`ml-4 mt-1 flex flex-col gap-0.5 border-l py-1 pl-3 ${
                            onDark ? 'border-white/10' : 'border-[#052e16]/10'
                          }`}
                        >
                          {platformLinks.map((item) => {
                            const Icon = item.icon
                            return (
                              <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={closeAll}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                                    isActive
                                      ? isDark
                                        ? 'bg-[#d9f99d]/10 text-[#d9f99d]'
                                        : 'bg-[#e7efda] text-[#0f3d25]'
                                      : onDark
                                        ? 'text-white/55 hover:bg-white/5 hover:text-white'
                                        : 'text-[#052e16]/55 hover:bg-brand-50 hover:text-brand-700'
                                  }`
                                }
                              >
                                <Icon className="size-3.5" />
                                {t(item.key)}
                              </NavLink>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {secondaryLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeAll}
                    className={({ isActive }) => mobileLinkClass(isActive)}
                  >
                    {t(link.key)}
                  </NavLink>
                ))}
              </div>

              <div
                className={`mt-3 flex flex-col gap-2 border-t pt-3 ${
                  onDark ? 'border-white/10' : 'border-black/5'
                }`}
              >
                {isInitialized ? (
                  isAuthenticated ? (
                    <>
                      <div
                        className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
                          onDark ? 'border-white/10 bg-white/[0.06]' : 'border-black/5 bg-brand-50/70'
                        }`}
                      >
                        <span className="flex size-9 items-center justify-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
                          {initials || 'UC'}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block whitespace-nowrap text-sm font-semibold">{displayName}</span>
                          <span className={`block text-[10px] font-semibold uppercase tracking-wide ${onDark ? 'text-brand-300' : 'text-brand-700'}`}>
                            {roleLabel(user.role)}
                          </span>
                        </span>
                      </div>
                      <Link
                        to={roleHome(user.role)}
                        onClick={closeAll}
                        className="rounded-full bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(22,163,74,0.7)] transition-colors hover:bg-brand-700"
                      >
                        {t('common.dashboard')}
                      </Link>
                      <Link
                        to="/messages"
                        onClick={closeAll}
                        className={`rounded-full border px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                          onDark
                            ? 'border-white/20 text-white/80 hover:border-white/40 hover:text-white'
                            : 'border-black/10 text-[#052e16]/70 hover:border-brand-500/40 hover:text-brand-700'
                        }`}
                      >
                        {t('common.messages')}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className={`rounded-full border px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                          onDark
                            ? 'border-white/20 text-white/80 hover:border-white/40 hover:text-white'
                            : 'border-black/10 text-[#052e16]/70 hover:border-brand-500/40 hover:text-brand-700'
                        }`}
                      >
                        {t('common.signOut')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={closeAll}
                        className={`rounded-full border px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                          onDark
                            ? 'border-white/20 text-white/80 hover:border-white/40 hover:text-white'
                            : 'border-black/10 text-[#052e16]/70 hover:border-brand-500/40 hover:text-brand-700'
                        }`}
                      >
                        {t('common.signIn')}
                      </Link>
                      <Link
                        to="/register"
                        onClick={closeAll}
                        className="rounded-full bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(22,163,74,0.7)] transition-colors hover:bg-brand-700"
                      >
                        {t('common.getStarted')}
                      </Link>
                    </>
                  )
                ) : null}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
