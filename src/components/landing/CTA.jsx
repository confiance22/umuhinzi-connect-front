import { ArrowRight, ArrowUpRight, Check, Sprout } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

export default function CTA() {
  const { t } = useLanguage()
  const proofs = t('landing.cta.proofs')

  return (
    <section className="px-4 pb-24 pt-8 2xl:pb-32 2xl:pt-12">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[#0f3d25]/15 bg-[#fbf7ec] shadow-[0_40px_100px_-64px_rgba(15,61,37,0.55)] dark:border-white/10 dark:bg-[#07160d] dark:shadow-black/50"
      >
        <div className="grid lg:grid-cols-[1.04fr_0.96fr]">
          <div className="relative z-10 flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-[#1eff00]" aria-hidden="true" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#0f3d25]/50 dark:text-white/45">
                {t('landing.cta.eyebrow')}
              </p>
            </div>

            <h2 className="mt-6 max-w-xl font-serif text-[clamp(2.45rem,5.4vw,4.15rem)] leading-[0.98] tracking-[-0.045em] text-[#0f3d25] dark:text-[#fbf7ec]">
              {t('landing.cta.headingLead')}{' '}
              <span className="relative inline-block text-[#15803d] dark:text-[#d9f99d]">
                {t('landing.cta.headingAccent')}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full text-[#1eff00] dark:text-[#d9f99d]/70"
                >
                  <path
                    d="M2 8c57-5 117-7 296-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-[1.8] text-[#0f3d25]/60 dark:text-white/55">
              {t('landing.cta.description')}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#0f3d25] px-6 py-3.5 text-sm font-semibold text-[#fbf7ec] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#174c2e] dark:bg-[#d9f99d] dark:text-[#0f3d25] dark:hover:bg-[#e8ffb2]"
              >
                {t('common.createAccount')}
                <span className="flex size-6 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5 dark:bg-[#0f3d25]/10">
                  <ArrowRight size={13} strokeWidth={2.4} />
                </span>
              </Link>
              <Link
                to="/market-prices"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#0f3d25]/20 px-6 py-3.5 text-sm font-medium text-[#0f3d25]/70 transition-colors hover:border-[#0f3d25]/45 hover:text-[#0f3d25] dark:border-white/15 dark:text-white/65 dark:hover:border-white/35 dark:hover:text-white"
              >
                {t('common.seePrices')}
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            <ul className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-[#0f3d25]/10 pt-5 dark:border-white/10">
              {proofs.map((proof) => (
                <li
                  key={proof}
                  className="flex items-center gap-2 text-[11px] font-medium text-[#0f3d25]/55 dark:text-white/45"
                >
                  <span className="flex size-4 items-center justify-center rounded-full bg-[#d9f99d] text-[#0f3d25] dark:bg-[#d9f99d]/15 dark:text-[#d9f99d]">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  {proof}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[430px] overflow-hidden border-t border-[#0f3d25]/10 bg-[#0f3d25] p-5 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
            >
              <defs>
                <pattern
                  id="cta-agaseke"
                  width="34"
                  height="34"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="34" height="34" fill="transparent" />
                  <path d="M0 17h34M17 0v34" stroke="#d9f99d" strokeWidth="2.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-agaseke)" />
            </svg>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full border-[26px] border-[#d9f99d]/10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-20 size-56 rounded-full border-[18px] border-[#fbf7ec]/[0.06]"
            />

            <div className="relative flex h-full flex-col justify-between gap-6">
              <div className="flex items-center justify-between gap-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#fbf7ec]/45">
                <span>{t('landing.cta.cardKicker')}</span>
                <span>{t('landing.cta.cardLot')}</span>
              </div>

              <article className="relative mx-auto w-full max-w-[340px] -rotate-2 rounded-[24px] border border-[#0f3d25]/20 bg-[#fbf7ec] p-5 text-[#13251a] shadow-[12px_14px_0_rgba(0,0,0,0.2)] transition-transform duration-500 hover:rotate-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#0f3d25]/45">
                      {t('landing.cta.cardLabel')}
                    </p>
                    <h3 className="mt-2 font-serif text-[2rem] leading-none tracking-[-0.04em]">
                      {t('landing.cta.cardTitle')}
                    </h3>
                    <p className="mt-1.5 text-[11px] text-[#0f3d25]/50">
                      {t('landing.cta.cardOrigin')}
                    </p>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#0f3d25]/20 bg-[#d9f99d] text-[#0f3d25]">
                    <Sprout size={18} strokeWidth={1.8} />
                  </span>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3 border-y border-dashed border-[#0f3d25]/20 py-4">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/45">
                      {t('landing.cta.cardPriceLabel')}
                    </p>
                    <p className="mt-1 flex items-baseline gap-1 font-serif text-[2rem] leading-none tracking-[-0.03em]">
                      {t('landing.cta.cardPrice')}
                      <span className="font-sans text-[10px] font-normal text-[#0f3d25]/45">
                        {t('landing.cta.cardPriceUnit')}
                      </span>
                    </p>
                  </div>
                  <p className="mb-0.5 max-w-[92px] text-right text-[9px] font-semibold leading-[1.45] text-[#15803d]">
                    {t('landing.cta.cardTrend')}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#0f3d25] text-[9px] font-bold text-[#d9f99d]">
                      JM
                    </span>
                    <div>
                      <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#0f3d25]/40">
                        {t('landing.cta.cardGrowerLabel')}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold text-[#13251a]">
                        {t('landing.cta.cardGrower')}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#0f3d25] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#fbf7ec]">
                    {t('landing.cta.cardBadge')}
                  </span>
                </div>
              </article>

              <div className="flex flex-wrap items-center justify-between gap-3 text-[9px] font-semibold uppercase tracking-[0.16em]">
                <span className="flex items-center gap-2 text-[#fbf7ec]/55">
                  <span className="size-1.5 rounded-full bg-[#1eff00]" aria-hidden="true" />
                  {t('landing.cta.cardFooter')}
                </span>
                <span className="rounded-full border border-[#d9f99d]/25 px-2.5 py-1.5 text-[#d9f99d]/80">
                  {t('landing.cta.cardFee')}
                </span>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="absolute -bottom-3 -right-3 flex size-24 rotate-6 flex-col items-center justify-center rounded-full border border-[#0f3d25] bg-[#d9f99d] text-center text-[#0f3d25] shadow-[4px_5px_0_rgba(0,0,0,0.22)] sm:-bottom-5 sm:-right-5 sm:size-28"
            >
              <span className="absolute inset-[5px] rounded-full border border-dashed border-[#0f3d25]/35" />
              <span className="relative text-[7px] font-bold uppercase tracking-[0.16em]">
                {t('landing.cta.cardStampLead')}
              </span>
              <span className="relative mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em]">
                {t('landing.cta.cardStampAccent')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
