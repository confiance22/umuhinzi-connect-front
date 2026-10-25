import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandMark } from '../common/Brand'
import { useLanguage } from '../../context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  const platformLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/harvests', label: t('nav.harvests') },
    { to: '/how-it-works', label: t('nav.howItWorks') },
    { to: '/market-prices', label: t('nav.marketPrices') }
  ]

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#031008] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_82%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-8 border-b border-white/10 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Umuhinzi Connect home">
              <BrandMark size={28} />
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                Umuhinzi <span className="text-brand-300">Connect</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-white/35">
              {t('footer.tagline')}
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-3" aria-label="Footer navigation">
            {platformLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-[11px] font-medium uppercase tracking-[0.08em] text-white/45 transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-brand-300 after:transition-[width] hover:text-brand-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 py-5 text-[10px] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {t('footer.copyright')}
          </p>
          <p className="inline-flex items-center gap-1.5">
            <MapPin size={11} className="text-brand-400/70" />
            {t('footer.madeIn')}
          </p>
        </div>
      </div>
    </footer>
  )
}
