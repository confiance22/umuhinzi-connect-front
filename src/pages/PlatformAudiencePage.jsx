import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Handshake,
  LineChart,
  MapPin,
  MessagesSquare,
  Scale,
  ShoppingBasket,
  Sprout,
  Tag,
  Users
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PublicShell from '../components/public/PublicShell'
import { useLanguage } from '../context/LanguageContext'

const ease = [0.16, 1, 0.3, 1]

const benefitStyles = [
  {
    surface: 'bg-[#e7efda] dark:bg-[#10261a]',
    ink: 'text-[#0f3d25] dark:text-[#d9f99d]',
    chip: 'bg-[#0f3d25] text-[#fbf7ec] dark:bg-[#d9f99d] dark:text-[#0f3d25]'
  },
  {
    surface: 'bg-[#f4e3c9] dark:bg-[#2a1e10]',
    ink: 'text-[#7a3d1f] dark:text-[#f4c58c]',
    chip: 'bg-[#7a3d1f] text-[#fbf7ec] dark:bg-[#f4c58c] dark:text-[#2a1e10]'
  },
  {
    surface: 'bg-[#eeded7] dark:bg-[#291715]',
    ink: 'text-[#6d2f32] dark:text-[#f0a6a0]',
    chip: 'bg-[#6d2f32] text-[#fbf7ec] dark:bg-[#f0a6a0] dark:text-[#291715]'
  },
  {
    surface: 'bg-[#f1e8c7] dark:bg-[#251f0d]',
    ink: 'text-[#6b4b10] dark:text-[#efd47d]',
    chip: 'bg-[#6b4b10] text-[#fbf7ec] dark:bg-[#efd47d] dark:text-[#251f0d]'
  }
]

const config = {
  farmers: {
    prefix: 'farmersPage',
    primaryTo: '/register',
    secondaryTo: '/market-prices',
    heroIcon: Sprout,
    benefitIcons: [Tag, Users, Handshake, LineChart],
    accent: 'bg-[#d9f99d] text-[#0f3d25]',
    ticketAccent: 'text-[#d9f99d]'
  },
  buyers: {
    prefix: 'buyersPage',
    primaryTo: '/harvests',
    secondaryTo: '/market-prices',
    heroIcon: ShoppingBasket,
    benefitIcons: [BadgeCheck, Scale, MessagesSquare, MapPin],
    accent: 'bg-[#f4c58c] text-[#2a1e10]',
    ticketAccent: 'text-[#f4c58c]'
  }
}

function AudiencePage({ audience }) {
  const { t } = useLanguage()
  const settings = config[audience]
  const prefix = settings.prefix
  const benefits = t(`${prefix}.benefits`) || []
  const steps = t(`${prefix}.steps`) || []
  const cardRows = t(`${prefix}.cardRows`) || []
  const HeroIcon = settings.heroIcon

  return (
    <PublicShell>
      <section data-hero className="mx-auto max-w-[1180px]">
        <div className="grid gap-8 border-b border-[#0f3d25]/10 pb-10 dark:border-white/10 lg:grid-cols-[1fr_370px] lg:items-end lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="flex flex-wrap items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.16em]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d9f99d] px-3 py-1.5 text-[#0f3d25] dark:bg-[#d9f99d]/15 dark:text-[#d9f99d]">
                <HeroIcon className="size-3" />
                {t(`${prefix}.badge`)}
              </span>
              <span className="text-[#13251a]/35 dark:text-white/30">Umuhinzi Connect</span>
            </div>

            <h1 className="mt-6 max-w-[760px] font-serif text-[clamp(3.1rem,7vw,6.1rem)] leading-[0.88] tracking-[-0.06em]">
              {t(`${prefix}.title`)}
            </h1>
            <p className="mt-6 max-w-[550px] text-sm leading-[1.8] text-[#13251a]/55 dark:text-white/45 sm:text-[15px]">
              {t(`${prefix}.subtitle`)}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={settings.primaryTo}
                className="inline-flex items-center gap-2 rounded-full bg-[#0f3d25] px-6 py-3 text-xs font-semibold text-[#f7f3e9] transition-colors hover:bg-[#14532d] dark:bg-[#d9f99d] dark:text-[#0f3d25] dark:hover:bg-white"
              >
                {t(`${prefix}.primaryCta`)}
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to={settings.secondaryTo}
                className="inline-flex items-center gap-2 rounded-full border border-[#0f3d25]/20 px-6 py-3 text-xs font-semibold text-[#13251a]/70 transition-colors hover:border-[#0f3d25] hover:text-[#0f3d25] dark:border-white/20 dark:text-white/55 dark:hover:border-white/40 dark:hover:text-white"
              >
                {t(`${prefix}.secondaryCta`)}
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
            <div className="relative flex items-center justify-between gap-3">
              <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#d9f99d]/65 dark:text-brand-200/55">
                {t(`${prefix}.cardLabel`)}
              </p>
              <span className={`flex size-9 items-center justify-center rounded-full ${settings.accent}`}>
                <HeroIcon className="size-4" />
              </span>
            </div>

            <h2 className="relative mt-5 max-w-[280px] font-serif text-[27px] leading-[1.02] tracking-[-0.04em]">
              {t(`${prefix}.cardTitle`)}
            </h2>

            <div className="relative mt-5 divide-y divide-[#f7f3e9]/10 border-y border-[#f7f3e9]/10 dark:divide-white/10 dark:border-white/10">
              {cardRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#f7f3e9]/35 dark:text-white/25">
                    {row.label}
                  </span>
                  <span className="text-right font-serif text-[15px] leading-none">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="relative mt-4 flex items-start gap-2">
              <span className={`mt-1 size-1.5 shrink-0 rounded-full ${settings.accent}`} />
              <p className="text-[8px] leading-relaxed text-[#f7f3e9]/35 dark:text-white/25">
                {t(`${prefix}.cardNote`)}
              </p>
            </div>
          </motion.aside>
        </div>

        <section className="py-14">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/45 dark:text-brand-200/40">
                {t(`${prefix}.benefitsLabel`)}
              </p>
              <h2 className="mt-3 max-w-[470px] font-serif text-[clamp(2.3rem,4vw,3.8rem)] leading-[0.96] tracking-[-0.05em]">
                {t(`${prefix}.benefitsTitle`)}
              </h2>
            </div>
            <div className="flex items-center justify-between gap-6 border-t border-[#0f3d25]/10 pt-4 dark:border-white/10">
              <p className="max-w-[370px] text-xs leading-[1.75] text-[#13251a]/45 dark:text-white/35">
                {t(`${prefix}.subtitle`)}
              </p>
              <span className="hidden font-serif text-[58px] leading-none tracking-[-0.06em] text-[#0f3d25]/10 dark:text-white/10 sm:block">
                04
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit, index) => {
              const style = benefitStyles[index] || benefitStyles[0]
              const Icon = settings.benefitIcons[index] || HeroIcon
              return (
                <motion.article
                  key={benefit.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.06, ease }}
                  className={`group relative overflow-hidden rounded-[24px] border border-[#0f3d25]/[0.12] p-6 ${style.surface} dark:border-white/10`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex size-11 items-center justify-center rounded-full ${style.chip}`}>
                      <Icon className="size-4" />
                    </span>
                    <span className="font-serif text-[42px] leading-none tracking-[-0.06em] opacity-15">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className={`mt-8 font-serif text-[24px] leading-[1.05] tracking-[-0.035em] ${style.ink}`}>
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-[10px] leading-[1.7] text-[#13251a]/55 dark:text-white/40">
                    {benefit.desc}
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

        <section className="border-t border-[#0f3d25]/10 py-14 dark:border-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/45 dark:text-brand-200/40">
                {t(`${prefix}.stepsLabel`)}
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.045em] sm:text-4xl">
                {t(`${prefix}.stepsTitle`)}
              </h2>
            </div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#13251a]/35 dark:text-white/30">
              {t(`${prefix}.badge`)}
            </p>
          </div>

          <div className="relative mt-8 grid gap-4 md:grid-cols-3">
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-10 hidden border-t border-dashed border-[#0f3d25]/20 dark:border-white/15 md:block"
            />
            {steps.map((step, index) => (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: index * 0.08, ease }}
                className="relative rounded-[24px] border border-[#0f3d25]/[0.12] bg-[#fbf7ec] p-6 text-[#13251a] shadow-[8px_10px_0_rgba(15,61,37,0.04)] dark:border-white/10 dark:bg-[#0b1710] dark:text-[#f2eee3] dark:shadow-[8px_10px_0_rgba(0,0,0,0.16)]"
              >
                <span className="relative z-10 flex size-10 items-center justify-center rounded-full bg-[#0f3d25] font-serif text-[15px] text-[#d9f99d] dark:bg-[#d9f99d] dark:text-[#0f3d25]">
                  0{index + 1}
                </span>
                <h3 className="mt-6 font-serif text-[24px] leading-[1.02] tracking-[-0.035em]">
                  {step.title}
                </h3>
                <p className="mt-3 text-[10px] leading-[1.7] text-[#13251a]/50 dark:text-white/35">
                  {step.desc}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[30px] border border-[#0f3d25] bg-[#0f3d25] text-[#f7f3e9] dark:border-white/10 dark:bg-[#0b1710]">
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
                {t(`${prefix}.badge`)}
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-[1.02] tracking-[-0.045em] sm:text-4xl">
                {t(`${prefix}.ctaTitle`)}
              </h2>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-[#f7f3e9]/55 dark:text-white/40 sm:text-sm">
                {t(`${prefix}.ctaSubtitle`)}
              </p>
            </div>
            <Link
              to={settings.primaryTo}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#d9f99d] px-6 py-3 text-xs font-semibold text-[#0f3d25] transition-colors hover:bg-white md:self-auto"
            >
              {t(`${prefix}.ctaButton`)}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </section>
    </PublicShell>
  )
}

export function ForFarmersPage() {
  return <AudiencePage audience="farmers" />
}

export function ForBuyersPage() {
  return <AudiencePage audience="buyers" />
}
