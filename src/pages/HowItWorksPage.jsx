import { motion } from 'framer-motion'
import {
  ArrowRight,
  HandCoins,
  LineChart,
  MapPinned,
  Package,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Truck,
  UserPlus
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PublicShell from '../components/public/PublicShell'
import { useLanguage } from '../context/LanguageContext'

const farmerIcons = [UserPlus, Sprout, ShoppingBasket, HandCoins]
const buyerIcons = [Search, LineChart, Package, Truck]

function JourneyCard({ audience, icon: Icon, stepIcons }) {
  const { t } = useLanguage()
  const isFarmer = audience === 'farmers'
  const steps = t(`how.${audience}.steps`)

  const accent = isFarmer
    ? {
        header: 'from-brand-600 to-brand-800',
        ring: 'bg-brand-500/10 text-brand-700 dark:text-brand-300',
        line: 'bg-brand-500/20 dark:bg-brand-400/20',
        icon: 'text-brand-600 dark:text-brand-300',
        border: 'hover:border-brand-500/30'
      }
    : {
        header: 'from-emerald-600 to-teal-800',
        ring: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
        line: 'bg-teal-500/20 dark:bg-teal-400/20',
        icon: 'text-teal-600 dark:text-teal-300',
        border: 'hover:border-teal-500/30'
      }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_24px_60px_-38px_rgba(5,46,22,0.35)] transition-colors dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none ${accent.border}`}
    >
      <div className={`relative overflow-hidden bg-gradient-to-br ${accent.header} p-6 text-white sm:p-8`}>
        <div className="absolute -right-10 -top-10 size-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Icon className="size-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              {t(`how.${audience}.label`)}
            </p>
            <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
              {t(`how.${audience}.title`)}
            </h2>
          </div>
        </div>
        <p className="relative mt-4 max-w-md text-sm leading-relaxed text-white/80">
          {t(`how.${audience}.description`)}
        </p>
      </div>

      <div className="relative p-6 sm:p-8">
        <div className={`absolute bottom-12 left-[3.25rem] top-12 w-px ${accent.line}`} />
        <ol className="space-y-7">
          {steps.map((step, index) => {
            const StepIcon = stepIcons[index] || Sprout
            return (
              <li key={step.title} className="relative flex gap-4">
                <span
                  className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white text-sm font-bold shadow-sm dark:border-white/10 dark:bg-[#0c1a12] ${accent.ring}`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <StepIcon className={`size-4 ${accent.icon}`} />
                    <h3 className="text-sm font-semibold text-ink dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted dark:text-gray-400">
                    {step.desc}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </motion.article>
  )
}

const trustIcons = [ShieldCheck, LineChart, MapPinned]

export default function HowItWorksPage() {
  const { t } = useLanguage()
  const trustPoints = t('how.trustPoints')

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
            <Sprout className="size-3.5" />
            {t('how.badge')}
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink dark:text-white sm:text-4xl md:text-5xl">
            {t('how.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted dark:text-gray-400 sm:text-base">
            {t('how.subtitle')}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <JourneyCard audience="farmers" icon={Sprout} stepIcons={farmerIcons} />
          <JourneyCard audience="buyers" icon={ShoppingBasket} stepIcons={buyerIcons} />
        </div>

        <section className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-2xl font-semibold text-ink dark:text-white sm:text-3xl">
              {t('how.trustTitle')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted dark:text-gray-400">
              {t('how.trustSubtitle')}
            </p>
          </motion.div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {trustPoints.map((point, index) => {
              const Icon = trustIcons[index] || ShieldCheck
              return (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_-34px_rgba(5,46,22,0.3)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-ink dark:text-white">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted dark:text-gray-400">
                    {point.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-[0_30px_80px_-40px_rgba(22,163,74,0.65)] sm:p-12">
          <div className="absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">{t('how.ctaTitle')}</h2>
              <p className="mt-3 max-w-xl text-sm text-brand-50/90">{t('how.ctaSubtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('how.ctaButton')}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/harvests"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {t('common.browseHarvests')}
              </Link>
            </div>
          </div>
        </section>
      </section>
    </PublicShell>
  )
}
