import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLockup from '../common/Brand'
import SocialLinks from './SocialLinks'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'

export default function PublicFooter() {
  const { isDark } = useTheme()
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  const platformLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/harvests', label: t('nav.harvests') },
    { to: '/platform/how-it-works', label: t('nav.howItWorks') },
    { to: '/market-prices', label: t('nav.marketPrices') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') }
  ]

  return (
    <footer className="relative overflow-hidden border-t border-[#0f3d25]/10 bg-[#fbf7ec]/80 transition-colors dark:border-white/10 dark:bg-[#08140d]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full border border-[#0f3d25]/10 dark:border-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-44 left-1/4 size-72 rounded-full border border-[#0f3d25]/[0.06] dark:border-white/[0.06]"
      />

      <div className="relative mx-auto max-w-[1180px] px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1.05fr]">
          <div>
            <BrandLockup dark={!isDark} size={30} textClassName="text-[15px]" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#13251a]/55 dark:text-white/45">
              {t('footer.tagline')}
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#0f3d25]/15 bg-[#d9f99d]/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f3d25] dark:border-brand-300/20 dark:bg-brand-300/10 dark:text-brand-200">
              <MapPin className="size-3.5" />
              {t('footer.madeIn')}
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#13251a]/40 dark:text-white/35">
              {t('footer.platform')}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {platformLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-1.5 text-[#13251a]/65 transition-colors hover:text-[#0f3d25] dark:text-white/50 dark:hover:text-brand-200"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#13251a]/40 dark:text-white/35">
              {t('footer.account')}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  to="/login"
                  className="text-[#13251a]/65 transition-colors hover:text-[#0f3d25] dark:text-white/50 dark:hover:text-brand-200"
                >
                  {t('common.signIn')}
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-[#13251a]/65 transition-colors hover:text-[#0f3d25] dark:text-white/50 dark:hover:text-brand-200"
                >
                  {t('common.getStarted')}
                </Link>
              </li>
              <li>
                <Link
                  to="/harvests"
                  className="text-[#13251a]/65 transition-colors hover:text-[#0f3d25] dark:text-white/50 dark:hover:text-brand-200"
                >
                  {t('common.browseHarvests')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#13251a]/40 dark:text-white/35">
              {t('footer.contact')}
            </h3>
            <ul className="mt-5 space-y-3 text-[13px]">
              <li>
                <a
                  href={`mailto:${t('contact.emailValue')}`}
                  className="inline-flex items-start gap-2.5 text-[#13251a]/65 transition-colors hover:text-[#0f3d25] dark:text-white/50 dark:hover:text-brand-200"
                >
                  <Mail className="mt-0.5 size-3.5 shrink-0" />
                  <span className="break-all">{t('contact.emailValue')}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${t('contact.phoneValue').replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2.5 text-[#13251a]/65 transition-colors hover:text-[#0f3d25] dark:text-white/50 dark:hover:text-brand-200"
                >
                  <Phone className="size-3.5 shrink-0" />
                  {t('contact.phoneValue')}
                </a>
              </li>
            </ul>
            <h3 className="mt-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#13251a]/40 dark:text-white/35">
              {t('footer.follow')}
            </h3>
            <SocialLinks className="mt-4" />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#0f3d25]/10 pt-6 text-[10px] uppercase tracking-[0.12em] text-[#13251a]/35 dark:border-white/10 dark:text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {t('footer.copyright')}
          </p>
          <p className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#0f3d25] dark:bg-[#d9f99d]" />
            {t('harvests.badge')}
          </p>
        </div>
      </div>
    </footer>
  )
}
