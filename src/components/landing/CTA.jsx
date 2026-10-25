import { ArrowRight, Sprout } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

export default function CTA() {
  const { t } = useLanguage()

  return (
    <section className="px-4 py-20 2xl:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#052e16] via-[#04140b] to-[#020a05] px-6 py-14 text-center shadow-[0_40px_100px_-50px_rgba(5,46,22,0.8)] sm:px-10 sm:py-16"
      >
        <div
          className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-brand-500/15 blur-[110px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-brand-400/10 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,#000_40%,transparent_80%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-2xl">
          <span className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-brand-200 backdrop-blur-sm">
            <Sprout size={26} strokeWidth={1.6} />
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/40">
            Grow with Umuhinzi Connect
          </p>
          <h2 className="mx-auto mt-3 max-w-xl text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-white">
            Your harvest deserves a wider market.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/55">
            List what you grow, reach buyers across Rwanda and trade with prices you can trust.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#052e16] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-50 sm:w-auto"
            >
              {t('common.createAccount')}
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/market-prices"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-medium text-white/80 transition-colors hover:border-white/40 hover:bg-white/[0.06] hover:text-white sm:w-auto"
            >
              {t('common.seePrices')}
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
