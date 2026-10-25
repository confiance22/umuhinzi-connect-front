import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }
  })
}

const marketRows = [
  { crop: 'Irish potatoes', region: 'Musanze', price: 'RWF 320', change: '+4.2%', up: true },
  { crop: 'Tomatoes', region: 'Kigali', price: 'RWF 650', change: '+2.8%', up: true },
  { crop: 'Maize', region: 'Nyagatare', price: 'RWF 410', change: '-1.1%', up: false }
]

const stats = [
  { value: '1,200+', label: 'Verified farmers' },
  { value: '30', label: 'Districts covered' },
  { value: '0', label: 'Middle layers' }
]

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section
      data-hero
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#f8faf7] px-5 pb-20 pt-28 dark:bg-[#04110a] sm:px-6 sm:pt-32 lg:px-8"
    >
      <div
        className="pointer-events-none absolute -left-40 -top-52 size-[620px] rounded-full bg-brand-400/20 blur-[130px] dark:bg-brand-500/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-72 -right-40 size-[640px] rounded-full bg-[#d8c9a8]/35 blur-[140px] dark:bg-brand-400/[0.06]"
        aria-hidden="true"
      />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-brand-950/[0.07] dark:text-brand-200/[0.08]"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M-120 742C126 664 318 606 552 616C790 626 948 708 1168 668C1308 643 1414 580 1560 512" stroke="currentColor" strokeWidth="1.1" />
        <path d="M-120 770C126 692 318 634 552 644C790 654 948 736 1168 696C1308 671 1414 608 1560 540" stroke="currentColor" strokeWidth="1.1" />
        <path d="M-120 798C126 720 318 662 552 672C790 682 948 764 1168 724C1308 699 1414 636 1560 568" stroke="currentColor" strokeWidth="1.1" />
        <path d="M-120 826C126 748 318 690 552 700C790 710 948 792 1168 752C1308 727 1414 664 1560 596" stroke="currentColor" strokeWidth="1.1" />
        <path d="M-120 854C126 776 318 718 552 728C790 738 948 820 1168 780C1308 755 1414 692 1560 624" stroke="currentColor" strokeWidth="1.1" />
        <path d="M-120 882C126 804 318 746 552 756C790 766 948 848 1168 808C1308 783 1414 720 1560 652" stroke="currentColor" strokeWidth="1.1" />
      </svg>

      <div className="relative mx-auto grid w-full max-w-[1180px] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.05}
          variants={fadeUp}
          className="max-w-[660px]"
        >
          <div className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink/50 dark:text-white/45">
            <span className="h-px w-10 bg-brand-600/50 dark:bg-brand-400/50" />
            Rwanda&apos;s farm-to-market network
          </div>

          <h1 className="max-w-[640px] text-[clamp(3.15rem,7.3vw,6.2rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-ink dark:text-white">
            Good harvests
            <br />
            deserve a{' '}
            <span className="font-light italic text-brand-700 dark:text-brand-300">
              fair market.
            </span>
          </h1>

          <p className="mt-7 max-w-[520px] text-[15px] font-light leading-relaxed text-ink/60 dark:text-white/60 sm:text-base">
            A direct marketplace for Rwandan farmers, buyers, and cooperatives. List what you
            grow, discover what&apos;s fresh, and agree on a fair price — without the middle layer.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Link
              to="/harvests"
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_40px_-16px_rgba(22,163,74,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700 active:translate-y-0"
            >
              {t('common.browseHarvests')}
            </Link>
            <Link
              to="/how-it-works"
              className="group inline-flex items-center justify-center gap-2 px-1 py-2 text-sm font-medium text-ink/70 transition-colors hover:text-brand-700 dark:text-white/70 dark:hover:text-brand-300"
            >
              {t('nav.howItWorks')}
              <span className="h-px w-5 bg-current transition-all duration-300 group-hover:w-8" />
            </Link>
          </div>

          <div className="mt-11 grid max-w-[520px] grid-cols-3 border-t border-black/10 pt-6 dark:border-white/10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-semibold tracking-tight text-ink dark:text-white sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink/45 dark:text-white/40">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.22}
          variants={fadeUp}
          className="relative mx-auto w-full max-w-[440px] lg:max-w-none"
        >
          <div
            className="absolute -inset-8 rounded-[3rem] bg-brand-500/10 blur-3xl dark:bg-brand-500/[0.08]"
            aria-hidden="true"
          />

          <div className="relative overflow-hidden rounded-[1.75rem] border border-black/10 bg-white/80 p-4 shadow-[0_40px_90px_-50px_rgba(5,46,22,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-[0_40px_100px_-40px_rgba(0,0,0,0.8)] sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-4 dark:border-white/10">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-ink/40 dark:text-white/40">
                  Market board
                </p>
                <p className="mt-1.5 text-lg font-semibold tracking-tight text-ink dark:text-white">
                  Today&apos;s harvest
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-600/20 bg-brand-500/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-700 dark:border-brand-400/20 dark:text-brand-300">
                <span className="size-1.5 animate-pulse rounded-full bg-brand-500" />
                Live
              </span>
            </div>

            <div className="divide-y divide-black/5 dark:divide-white/10">
              {marketRows.map((row) => (
                <div key={row.crop} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink dark:text-white">
                      {row.crop}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink/45 dark:text-white/40">
                      {row.region}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-ink dark:text-white">
                      {row.price}
                      <span className="ml-0.5 text-[10px] font-normal text-ink/40 dark:text-white/35">
                        /kg
                      </span>
                    </p>
                    <p
                      className={`mt-0.5 text-[10px] font-semibold tabular-nums ${
                        row.up
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {row.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between gap-4 rounded-xl bg-[#052e16] px-4 py-3.5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Farm-gate average
                </p>
                <p className="mt-1 text-sm font-semibold text-white">12% above last season</p>
              </div>
              <Link
                to="/market-prices"
                className="shrink-0 text-[10px] font-semibold text-brand-300 underline decoration-brand-300/40 underline-offset-4 transition-colors hover:text-white"
              >
                View prices
              </Link>
            </div>
          </div>

          <div className="absolute -left-3 top-16 hidden rounded-full border border-black/10 bg-white/90 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-ink/55 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#0b1f13]/90 dark:text-white/55 sm:block">
            Direct trade
          </div>
          <div className="absolute -right-3 bottom-20 hidden rounded-full border border-brand-600/20 bg-brand-50/90 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-700 shadow-lg backdrop-blur-md dark:border-brand-400/20 dark:bg-[#0b1f13]/90 dark:text-brand-300 sm:block">
            Fair price
          </div>
        </motion.div>
      </div>
    </section>
  )
}
