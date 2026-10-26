import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ClipboardList,
  Handshake,
  MapPin,
  ShieldCheck,
  Sprout,
  Truck
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PublicShell from '../components/public/PublicShell'
import { useLanguage } from '../context/LanguageContext'

const routeIcons = [Sprout, ClipboardList, Handshake, Truck]

const trustStyles = [
  {
    icon: ShieldCheck,
    surface: 'bg-[#e7efda] dark:bg-[#10261a]',
    ink: 'text-[#0f3d25] dark:text-[#d9f99d]',
    chip: 'bg-[#0f3d25] text-[#fbf7ec] dark:bg-[#d9f99d] dark:text-[#0f3d25]'
  },
  {
    icon: BadgeCheck,
    surface: 'bg-[#f4e3c9] dark:bg-[#2a1e10]',
    ink: 'text-[#7a3d1f] dark:text-[#f4c58c]',
    chip: 'bg-[#7a3d1f] text-[#fbf7ec] dark:bg-[#f4c58c] dark:text-[#2a1e10]'
  },
  {
    icon: MapPin,
    surface: 'bg-[#eeded7] dark:bg-[#291715]',
    ink: 'text-[#6d2f32] dark:text-[#f0a6a0]',
    chip: 'bg-[#6d2f32] text-[#fbf7ec] dark:bg-[#f0a6a0] dark:text-[#291715]'
  }
]

const ease = [0.16, 1, 0.3, 1]

function JourneyPanel({ kind, t, steps, Icon, dark = false }) {
  const isFarmer = kind === 'farmers'
  const cta = isFarmer ? t('how.farmersCta') : t('how.buyersCta')
  const ctaTo = isFarmer ? '/register' : '/harvests'

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ duration: 0.65, ease }}
      className={`relative flex flex-col overflow-hidden rounded-[30px] border p-7 sm:p-9 ${
        dark
          ? 'border-[#0f3d25] bg-[#0f3d25] text-[#f7f3e9] dark:border-white/10 dark:bg-[#0b1710]'
          : 'border-[#0f3d25]/15 bg-[#fbf7ec] text-[#13251a] shadow-[12px_14px_0_rgba(15,61,37,0.055)] dark:border-white/[0.12] dark:bg-[#0b1710] dark:text-[#f2eee3] dark:shadow-[12px_14px_0_rgba(0,0,0,0.2)]'
      }`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border ${
          dark ? 'border-[#f7f3e9]/10 dark:border-white/10' : 'border-[#0f3d25]/10 dark:border-white/10'
        }`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.15em] ${
              dark
                ? 'bg-[#d9f99d] text-[#0f3d25]'
                : 'bg-[#e7efda] text-[#0f3d25] dark:bg-[#d9f99d]/15 dark:text-[#d9f99d]'
            }`}
          >
            <Icon className="size-3" />
            {t(`how.${kind}.label`)}
          </p>
          <h2 className="mt-5 max-w-[390px] font-serif text-[34px] leading-[0.96] tracking-[-0.045em] sm:text-[42px]">
            {t(`how.${kind}.title`)}
          </h2>
        </div>
        <span
          className={`font-serif text-[64px] leading-[0.7] tracking-[-0.06em] ${
            dark ? 'text-[#f7f3e9]/15 dark:text-white/10' : 'text-[#0f3d25]/10 dark:text-white/10'
          }`}
        >
          {isFarmer ? '01' : '02'}
        </span>
      </div>

      <p
        className={`relative mt-4 max-w-[420px] text-[12px] leading-[1.75] ${
          dark ? 'text-[#f7f3e9]/55 dark:text-white/40' : 'text-[#13251a]/55 dark:text-white/40'
        }`}
      >
        {t(`how.${kind}.description`)}
      </p>

      <ol
        className={`relative mt-7 border-t ${
          dark ? 'border-[#f7f3e9]/[0.12] dark:border-white/10' : 'border-[#0f3d25]/10 dark:border-white/10'
        }`}
      >
        {steps.map((step, index) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 + index * 0.06 }}
            className={`grid grid-cols-[30px_1fr] gap-3 border-b py-4 ${
              dark ? 'border-[#f7f3e9]/[0.12] dark:border-white/10' : 'border-[#0f3d25]/10 dark:border-white/10'
            }`}
          >
            <span
              className={`mt-0.5 flex size-7 items-center justify-center rounded-full text-[8px] font-bold ${
                dark
                  ? 'bg-[#d9f99d] text-[#0f3d25]'
                  : 'bg-[#e7efda] text-[#0f3d25] dark:bg-[#d9f99d]/15 dark:text-[#d9f99d]'
              }`}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="text-[13px] font-semibold leading-snug">{step.title}</h3>
              <p
                className={`mt-1.5 text-[10px] leading-[1.65] ${
                  dark ? 'text-[#f7f3e9]/45 dark:text-white/35' : 'text-[#13251a]/45 dark:text-white/35'
                }`}
              >
                {step.desc}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>

      <Link
        to={ctaTo}
        className={`relative mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-[10px] font-semibold transition-colors ${
          dark
            ? 'bg-[#d9f99d] text-[#0f3d25] hover:bg-white'
            : 'bg-[#0f3d25] text-[#fbf7ec] hover:bg-[#14532d] dark:bg-[#d9f99d] dark:text-[#0f3d25] dark:hover:bg-white'
        }`}
      >
        {cta}
        <ArrowRight className="size-3.5" />
      </Link>
    </motion.article>
  )
}

export default function HowItWorksPage() {
  const { t } = useLanguage()
  const routeStops = t('how.routeStops') || []
  const farmerSteps = t('how.farmers.steps') || []
  const buyerSteps = t('how.buyers.steps') || []
  const trustPoints = t('how.trustPoints') || []

  return (
    <PublicShell>
      <section data-hero className="mx-auto max-w-[1180px]">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="flex flex-wrap items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.16em]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d9f99d] px-3 py-1.5 text-[#0f3d25] dark:bg-[#d9f99d]/15 dark:text-[#d9f99d]">
                <span className="size-1.5 rounded-full bg-[#0f3d25] dark:bg-[#d9f99d]" />
                {t('how.badge')}
              </span>
              <span className="text-[#13251a]/35 dark:text-white/30">{t('how.summary')}</span>
            </div>

            <h1 className="mt-6 max-w-[720px] font-serif text-[clamp(3.1rem,7vw,6.1rem)] leading-[0.88] tracking-[-0.06em]">
              {t('how.title')}
            </h1>
            <p className="mt-6 max-w-[530px] text-sm leading-[1.8] text-[#13251a]/55 dark:text-white/45 sm:text-[15px]">
              {t('how.subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#0f3d25] px-6 py-3 text-xs font-semibold text-[#f7f3e9] transition-colors hover:bg-[#14532d] dark:bg-[#d9f99d] dark:text-[#0f3d25] dark:hover:bg-white"
              >
                {t('how.farmersCta')}
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/harvests"
                className="inline-flex items-center gap-2 rounded-full border border-[#0f3d25]/20 px-6 py-3 text-xs font-semibold text-[#13251a]/70 transition-colors hover:border-[#0f3d25] hover:text-[#0f3d25] dark:border-white/20 dark:text-white/55 dark:hover:border-white/40 dark:hover:text-white"
              >
                {t('how.buyersCta')}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 30, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease }}
            className="relative overflow-hidden rounded-[30px] border border-[#0f3d25] bg-[#0f3d25] p-6 text-[#f7f3e9] shadow-[12px_14px_0_rgba(15,61,37,0.12)] dark:border-white/10 dark:bg-[#0b1710] dark:shadow-[12px_14px_0_rgba(0,0,0,0.2)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full border border-[#f7f3e9]/10 dark:border-white/10"
            />
            <div className="relative flex items-center justify-between gap-4 text-[7px] font-semibold uppercase tracking-[0.16em] text-[#d9f99d]/65 dark:text-brand-200/55">
              <span>{t('how.routeLabel')}</span>
              <span className="inline-flex items-center gap-1.5 text-[#f7f3e9]/40 dark:text-white/30">
                <span className="size-1.5 animate-pulse rounded-full bg-[#d9f99d] dark:bg-brand-200" />
                KGL
              </span>
            </div>

            <p className="relative mt-3 max-w-[260px] font-serif text-[22px] leading-[1.1] tracking-[-0.03em]">
              {t('how.routeNote')}
            </p>

            <div className="relative mt-5 space-y-2">
              <div
                aria-hidden="true"
                className="absolute bottom-6 left-[23px] top-6 border-l border-dashed border-[#d9f99d]/25 dark:border-brand-200/20"
              />
              {routeStops.map((stop, index) => {
                const Icon = routeIcons[index] || Sprout
                return (
                  <motion.div
                    key={stop}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.24 + index * 0.08 }}
                    className="relative flex items-center gap-3 rounded-[16px] border border-[#f7f3e9]/10 bg-[#f7f3e9]/[0.045] p-2.5 dark:border-white/10 dark:bg-white/[0.035]"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#d9f99d] text-[#0f3d25]">
                      <Icon className="size-4" />
                    </span>
                    <span className="font-serif text-[17px] leading-none">{stop}</span>
                    <span className="ml-auto text-[8px] font-semibold tracking-[0.14em] text-[#f7f3e9]/30 dark:text-white/25">
                      0{index + 1}
                    </span>
                  </motion.div>
                )
              })}
            </div>

            <div className="relative mt-4 flex items-center justify-between gap-3 border-t border-dashed border-[#f7f3e9]/15 pt-4 text-[7px] font-semibold uppercase tracking-[0.14em] text-[#f7f3e9]/35 dark:border-white/10 dark:text-white/25">
              <span>{t('how.farmGate')}</span>
              <span className="h-px flex-1 bg-[#f7f3e9]/10 dark:bg-white/10" />
              <span>{t('how.marketDoor')}</span>
            </div>
          </motion.aside>
        </div>

        <section className="mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/45 dark:text-brand-200/40">
                {t('how.stepsLabel')}
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.045em] sm:text-4xl">
                {t('how.title')}
              </h2>
            </div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#13251a]/35 dark:text-white/30">
              {t('how.farmers.label')} / {t('how.buyers.label')}
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <JourneyPanel kind="farmers" t={t} steps={farmerSteps} Icon={Sprout} />
            <JourneyPanel kind="buyers" t={t} steps={buyerSteps} Icon={Handshake} dark />
          </div>
        </section>

        <section className="mt-16">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/45 dark:text-brand-200/40">
                {t('how.standardsLabel')}
              </p>
              <h2 className="mt-3 max-w-[430px] font-serif text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.98] tracking-[-0.05em]">
                {t('how.trustTitle')}
              </h2>
            </div>
            <div className="flex items-end justify-between gap-8 border-t border-[#0f3d25]/15 pt-4 dark:border-white/[0.12]">
              <p className="max-w-[420px] text-xs leading-[1.75] text-[#13251a]/50 dark:text-white/40">
                {t('how.trustSubtitle')}
              </p>
              <span className="hidden font-serif text-[64px] leading-none tracking-[-0.06em] text-[#0f3d25]/10 dark:text-white/10 sm:block">
                03
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {trustPoints.map((point, index) => {
              const style = trustStyles[index] || trustStyles[0]
              const Icon = style.icon
              return (
                <motion.article
                  key={point.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease }}
                  className={`group relative overflow-hidden rounded-[24px] border border-[#0f3d25]/[0.12] p-6 ${style.surface} dark:border-white/10`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex size-11 items-center justify-center rounded-full ${style.chip}`}>
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="font-serif text-[44px] leading-none tracking-[-0.06em] opacity-15">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className={`mt-8 font-serif text-[25px] leading-[1.05] tracking-[-0.035em] ${style.ink}`}>
                    {point.title}
                  </h3>
                  <p className="mt-3 text-[10px] leading-[1.7] text-[#13251a]/55 dark:text-white/40">
                    {point.desc}
                  </p>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-10 -right-8 size-28 rounded-full border border-[#0f3d25]/10 transition-transform duration-500 group-hover:scale-125 dark:border-white/10"
                  />
                </motion.article>
              )
            })}
          </div>
        </section>

        <section className="relative mt-16 overflow-hidden rounded-[30px] border border-[#0f3d25] bg-[#0f3d25] text-[#f7f3e9] dark:border-white/10 dark:bg-[#0b1710]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full border border-[#f7f3e9]/10 dark:border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-36 right-28 size-64 rounded-full border border-[#f7f3e9]/[0.06] dark:border-white/[0.06]"
          />
          <div className="relative flex flex-col gap-8 p-8 sm:p-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#d9f99d]/70 dark:text-brand-200/60">
                <span className="size-1.5 rounded-full bg-[#d9f99d] dark:bg-brand-200" />
                {t('how.badge')}
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-[1.02] tracking-[-0.045em] sm:text-4xl">
                {t('how.ctaTitle')}
              </h2>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-[#f7f3e9]/55 dark:text-white/40 sm:text-sm">
                {t('how.ctaSubtitle')}
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#d9f99d] px-6 py-3 text-xs font-semibold text-[#0f3d25] transition-colors hover:bg-white md:self-auto"
            >
              {t('how.ctaButton')}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </section>
    </PublicShell>
  )
}
