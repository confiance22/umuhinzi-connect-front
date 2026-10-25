import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BrandMark } from '../common/Brand'
import ThemeToggle from '../public/ThemeToggle'
import LanguageToggle from '../public/LanguageToggle'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'

const navLinks = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/harvests', key: 'nav.harvests' },
  { to: '/how-it-works', key: 'nav.howItWorks' },
  { to: '/market-prices', key: 'nav.marketPrices' }
]

export default function Navbar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [overHero, setOverHero] = useState(location.pathname === '/')
  const { isDark } = useTheme()
  const { t } = useLanguage()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (scrolled) setIsOpen(false)
  }, [scrolled])

  useEffect(() => {
    const updateNav = () => {
      setScrolled(window.scrollY > 0)

      if (location.pathname !== '/') {
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

  const onDark = isDark
  const floating = overHero && !scrolled
  const strongText = onDark ? 'text-white' : 'text-[#052e16]'
  const softText = onDark
    ? 'text-white/65 hover:text-white'
    : 'text-[#052e16]/60 hover:text-[#052e16]'
  const activeText = onDark ? 'text-white' : 'text-[#052e16]'
  const underline = onDark ? 'bg-white' : 'bg-brand-600'
  const divider = onDark ? 'bg-white/15' : 'bg-black/10'
  const toggleTone = onDark
    ? '!border-white/15 !bg-white/10 !text-white hover:!border-white/30 hover:!bg-white/15'
    : ''

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[1000] border-b transition-all duration-500 ${
        floating
          ? 'border-black/5 bg-transparent dark:border-white/10'
          : `backdrop-blur-xl ${
              isDark
                ? 'border-white/10 bg-[#050505]/90'
                : 'border-black/5 bg-white/90'
            } shadow-[0_10px_40px_-24px_rgba(5,46,22,0.35)]`
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-3 px-4 py-3 lg:px-8 lg:py-3.5">
        <Link to="/" aria-label="Umuhinzi Connect home" className="group flex shrink-0 items-center gap-2.5">
          <BrandMark
            size={30}
            dark={!onDark}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <span
            className={`hidden text-[15px] font-semibold tracking-[-0.02em] sm:inline ${strongText}`}
          >
            Umuhinzi <span className={onDark ? 'text-brand-300' : 'text-brand-600'}>Connect</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={`group relative py-2 text-[13px] font-medium transition-colors duration-300 ${
                onDark ? '' : ''
              }`}
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

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageToggle className={toggleTone} />
          <ThemeToggle className={toggleTone} />
          <span className={`mx-1 h-5 w-px ${divider}`} />
          <Link
            to="/login"
            className={`rounded-full px-3 py-2 text-[13px] font-medium transition-colors duration-300 ${
              onDark ? 'text-white/75 hover:text-white' : 'text-[#052e16]/65 hover:text-[#052e16]'
            }`}
          >
            {t('common.signIn')}
          </Link>
          <Link
            to="/register"
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-300 active:scale-[0.98] ${
              onDark
                ? 'bg-white text-[#052e16] shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:bg-brand-50'
                : 'bg-brand-600 text-white shadow-[0_10px_30px_-12px_rgba(22,163,74,0.7)] hover:bg-brand-700'
            }`}
          >
            {t('common.getStarted')}
          </Link>
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
            className={`absolute inset-x-0 top-full border-b lg:hidden ${
              onDark ? 'border-white/10 bg-[#06140c]' : 'border-black/5 bg-white'
            }`}
            aria-label="Mobile navigation"
          >
            <div className="mx-auto max-w-[1180px] px-4 py-4">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-600 text-white'
                          : onDark
                            ? 'text-white/75 hover:bg-white/5 hover:text-white'
                            : 'text-[#052e16]/65 hover:bg-brand-50 hover:text-brand-700'
                      }`
                    }
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
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
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
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(22,163,74,0.7)] transition-colors hover:bg-brand-700"
                >
                  {t('common.getStarted')}
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
