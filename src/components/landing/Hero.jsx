import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }
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
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#f6f1e6] px-5 pb-12 pt-28 text-[#122117] dark:bg-[#07100a] dark:text-[#f3f0e6] sm:px-6 sm:pt-32 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-14rem] top-1/2 hidden size-[44rem] -translate-y-1/2 rounded-full bg-[#ebe4d4] dark:bg-[#0b1710] xl:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-72 -left-40 size-[36rem] rounded-full border border-[#0f3d25]/10 dark:border-white/10"
      />

      <div className="relative mx-auto w-full max-w-[1180px]">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.05}
            variants={fadeUp}
            className="max-w-[680px]"
          >
            <h1 className="max-w-[660px] text-[clamp(3rem,6.3vw,5.7rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
              Good food starts with a{' '}
              <span className="relative inline-block text-brand-700 dark:text-brand-300">
                fair deal.
                <svg
                  aria-hidden="true"
                  viewBox="0 0 220 14"
                  preserveAspectRatio="none"
                  fill="none"
                  className="absolute -bottom-1 left-0 h-2.5 w-full text-brand-600/70 dark:text-brand-300/70"
                >
                  <path
                    d="M3 10C56 3 145 2 217 7"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-7 max-w-[490px] text-[15px] leading-[1.8] text-ink/65 dark:text-white/60 sm:text-base">
              Umuhinzi Connect puts Rwanda&apos;s harvests in front of real buyers — without the
              layers that eat the margin.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                to="/harvests"
                className="inline-flex items-center justify-center rounded-full bg-[#0f3d25] px-7 py-3.5 text-sm font-semibold text-[#f7f3e9] transition-colors hover:bg-[#14532d] dark:bg-[#d9f99d] dark:text-[#0f3d25] dark:hover:bg-white"
              >
                {t('common.browseHarvests')}
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-[#0f3d25]/20 px-7 py-3.5 text-sm font-medium text-ink/70 transition-colors hover:border-brand-700 hover:text-brand-700 dark:border-white/20 dark:text-white/65 dark:hover:border-brand-300 dark:hover:text-brand-300"
              >
                {t('nav.howItWorks')}
              </Link>
            </div>

            <div className="mt-12 grid max-w-[480px] grid-cols-3 gap-2.5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[18px] border border-[#0f3d25]/10 bg-[#fbf8ef]/65 px-3.5 py-4 dark:border-white/10 dark:bg-white/[0.025] sm:px-4"
                >
                  <p className="text-lg font-semibold tracking-tight sm:text-xl">{stat.value}</p>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-ink/45 dark:text-white/40 sm:text-[9px]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fadeUp}
            className="relative mx-auto w-full max-w-[420px] lg:max-w-none lg:pl-8"
          >
            <div
              aria-hidden="true"
              className="absolute -right-5 -top-7 size-28 rounded-full border border-[#0f3d25]/15 dark:border-white/15"
            />
            <div className="absolute -left-4 bottom-24 z-10 hidden rotate-[-3deg] rounded-2xl border border-[#0f3d25] bg-[#d9f99d] px-4 py-3 text-[8px] font-bold uppercase leading-[1.5] tracking-[0.18em] text-[#0f3d25] dark:border-brand-300/40 dark:bg-[#13301f] dark:text-brand-200 sm:block">
              Direct trade
              <br />
              No middlemen
            </div>

            <div className="relative overflow-hidden rounded-t-[230px] rounded-b-[32px] border border-[#0f3d25]/20 bg-[#fcf9f1] px-6 pb-6 pt-20 shadow-[14px_14px_0_#e2dac7] dark:border-white/15 dark:bg-[#0b1710] dark:shadow-[14px_14px_0_#0d1a11] sm:px-7">
              <div className="mx-auto flex size-20 flex-col items-center justify-center rounded-full bg-[#0f3d25] text-center text-[#d9f99d] dark:bg-[#d9f99d] dark:text-[#0f3d25]">
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em]">Market</span>
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">
                  Today
                </span>
              </div>

              <p className="mt-5 text-center text-[8px] font-semibold uppercase tracking-[0.24em] text-ink/40 dark:text-white/35">
                Farm-gate note / 25 Oct
              </p>

              <div className="mt-5">
                {marketRows.map((row) => (
                  <div
                    key={row.crop}
                    className="grid grid-cols-[1fr_auto] gap-4 border-b border-dashed border-black/15 py-4 last:border-b-0 dark:border-white/15"
                  >
                    <div>
                      <p className="text-sm font-semibold">{row.crop}</p>
                      <p className="mt-0.5 text-[10px] text-ink/45 dark:text-white/40">
                        {row.region}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
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

              <div className="mt-2 rounded-[18px] bg-[#0f3d25] px-4 py-3.5 text-[#f7f3e9] dark:bg-[#13301f]">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/55">
                    Basket average
                  </span>
                  <span className="text-xs font-semibold tabular-nums">RWF 460 /kg</span>
                </div>
                <p className="mt-1 text-[9px] text-[#d9f99d]/75 dark:text-brand-300/80">
                  Up 12% from last season
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 px-1 text-[8px] uppercase tracking-[0.16em] text-ink/40 dark:text-white/35">
              <span>Source: Umuhinzi market desk</span>
              <Link
                to="/market-prices"
                className="rounded-full border-b border-transparent pb-0.5 text-ink/65 transition-colors hover:border-brand-700 hover:text-brand-700 dark:text-white/55 dark:hover:border-brand-300 dark:hover:text-brand-300"
              >
                All prices
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="mt-14 hidden w-full flex-col gap-3 rounded-[28px] border border-[#0f3d25]/10 bg-[#fbf8ef]/75 px-5 py-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/40 dark:border-white/10 dark:bg-white/[0.025] dark:text-white/35 md:flex md:flex-row md:items-center md:gap-5 md:rounded-full md:px-7">
          <span className="shrink-0 text-brand-700 dark:text-brand-300">Crop index</span>
          <span className="hidden h-4 w-px bg-black/10 dark:bg-white/10 md:block" />
          <span className="truncate normal-case tracking-[0.08em]">
            Potatoes · Maize · Beans · Tomatoes · Avocado · Rice
          </span>
          <Link
            to="/market-prices"
            className="shrink-0 text-ink/60 transition-colors hover:text-brand-700 dark:text-white/50 dark:hover:text-brand-300 md:ml-auto"
          >
            View all prices
          </Link>
        </div>
      </div>
    </section>
  )
}
