import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import HeroSeedLibrary from './HeroSeedLibrary'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }
  })
}

export default function Hero() {
  const { t } = useLanguage()
  const marketRows = t('landing.hero.marketRows')
  const stats = [
    { value: '1,200+', label: t('landing.hero.stats.farmers') },
    { value: '30', label: t('landing.hero.stats.districts') },
    { value: '0', label: t('landing.hero.stats.layers') }
  ]

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
              {t('landing.hero.headlinePrefix')}{' '}
              <span className="relative inline-block text-brand-700 dark:text-brand-300">
                {t('landing.hero.headlineAccent')}
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
              {t('landing.hero.description')}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                to="/harvests"
                className="inline-flex items-center justify-center rounded-full bg-[#0f3d25] px-7 py-3.5 text-sm font-semibold text-[#f7f3e9] transition-colors hover:bg-[#14532d] dark:bg-[#d9f99d] dark:text-[#0f3d25] dark:hover:bg-white"
              >
                {t('common.browseHarvests')}
              </Link>
              <Link
                to="/platform/how-it-works"
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
            className="relative mx-auto w-full max-w-[460px] lg:max-w-none lg:pl-8"
          >
            <HeroSeedLibrary rows={marketRows} />
          </motion.div>
        </div>

        <div className="mt-14 hidden w-full flex-col gap-3 rounded-[28px] border border-[#0f3d25]/10 bg-[#fbf8ef]/75 px-5 py-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/40 dark:border-white/10 dark:bg-white/[0.025] dark:text-white/35 md:flex md:flex-row md:items-center md:gap-5 md:rounded-full md:px-7">
          <span className="shrink-0 text-brand-700 dark:text-brand-300">
            {t('landing.hero.cropIndex')}
          </span>
          <span className="hidden h-4 w-px bg-black/10 dark:bg-white/10 md:block" />
          <span className="truncate normal-case tracking-[0.08em]">
            {t('landing.hero.cropList')}
          </span>
          <Link
            to="/market-prices"
            className="shrink-0 text-ink/60 transition-colors hover:text-brand-700 dark:text-white/50 dark:hover:text-brand-300 md:ml-auto"
          >
            {t('landing.hero.viewAllPrices')}
          </Link>
        </div>
      </div>
    </section>
  )
}
