import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLockup from '../common/Brand'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'

export default function PublicFooter() {
  const { isDark } = useTheme()
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  const platformLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/harvests', label: t('nav.harvests') },
    { to: '/how-it-works', label: t('nav.howItWorks') },
    { to: '/market-prices', label: t('nav.marketPrices') }
  ]

  return (
    <footer className="border-t border-black/5 bg-white/70 transition-colors dark:border-white/10 dark:bg-[#050505]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <BrandLockup dark={!isDark} size={30} textClassName="text-[15px]" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted dark:text-gray-400">
              {t('footer.tagline')}
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-300">
              <MapPin className="size-3.5" />
              {t('footer.madeIn')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink dark:text-white">
              {t('footer.platform')}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {platformLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-muted transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink dark:text-white">
              {t('footer.account')}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  to="/login"
                  className="text-muted transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300"
                >
                  {t('common.signIn')}
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-muted transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300"
                >
                  {t('common.getStarted')}
                </Link>
              </li>
              <li>
                <Link
                  to="/harvests"
                  className="text-muted transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300"
                >
                  {t('common.browseHarvests')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-black/5 pt-6 text-xs text-muted dark:border-white/10 dark:text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {t('footer.copyright')}
          </p>
          <p className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-brand-500" />
            {t('harvests.badge')}
          </p>
        </div>
      </div>
    </footer>
  )
}
