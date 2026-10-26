import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Quote,
  Scale,
  ShieldCheck,
  Sprout
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PublicShell from '../components/public/PublicShell'
import { useLanguage } from '../context/LanguageContext'
import pageApi from '../api/pageApi'

const valueStyles = [
  {
    icon: Sprout,
    surface: 'bg-[#e7efda] dark:bg-[#10261a]',
    ink: 'text-[#0f3d25] dark:text-[#d9f99d]',
    chip: 'bg-[#0f3d25] text-[#fbf7ec] dark:bg-[#d9f99d] dark:text-[#0f3d25]'
  },
  {
    icon: Scale,
    surface: 'bg-[#f4e3c9] dark:bg-[#2a1e10]',
    ink: 'text-[#7a3d1f] dark:text-[#f4c58c]',
    chip: 'bg-[#7a3d1f] text-[#fbf7ec] dark:bg-[#f4c58c] dark:text-[#2a1e10]'
  },
  {
    icon: MapPin,
    surface: 'bg-[#eeded7] dark:bg-[#291715]',
    ink: 'text-[#6d2f32] dark:text-[#f0a6a0]',
    chip: 'bg-[#6d2f32] text-[#fbf7ec] dark:bg-[#f0a6a0] dark:text-[#291715]'
  },
  {
    icon: ShieldCheck,
    surface: 'bg-[#f1e8c7] dark:bg-[#251f0d]',
    ink: 'text-[#6b4b10] dark:text-[#efd47d]',
    chip: 'bg-[#6b4b10] text-[#fbf7ec] dark:bg-[#efd47d] dark:text-[#251f0d]'
  }
]

const ease = [0.16, 1, 0.3, 1]

export default function AboutPage() {
  const { t, isRw } = useLanguage()
  const [pageContent, setPageContent] = useState(null)

  useEffect(() => {
    let active = true
    pageApi.get('about')
      .then((res) => {
        if (active && res?.content) {
          setPageContent(res.content)
        }
      })
      .catch((err) => {
        console.warn('Could not load dynamic about page content:', err.message)
      })
    return () => {
      active = false
    }
  }, [])

  const dynamicStats = (!isRw && pageContent?.stats?.length) ? pageContent.stats : (t('about.stats') || [])
  const dynamicValues = (!isRw && pageContent?.values?.length) ? pageContent.values : (t('about.values') || [])
  const pageTitle = (!isRw && pageContent?.title) ? pageContent.title : t('about.title')
  const pageSubtitle = (!isRw && pageContent?.subtitle) ? pageContent.subtitle : t('about.subtitle')
  const pageBadge = (!isRw && pageContent?.badge) ? pageContent.badge : t('about.badge')
  const pageStamp = (!isRw && pageContent?.stamp) ? pageContent.stamp : t('about.stamp')

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
                <span className="size-1.5 rounded-full bg-[#0f3d25] dark:bg-[#d9f99d]" />
                {pageBadge}
              </span>
              <span className="text-[#13251a]/35 dark:text-white/30">{pageStamp}</span>
            </div>

            <h1 className="mt-6 max-w-[760px] font-serif text-[clamp(3.1rem,7vw,6.1rem)] leading-[0.88] tracking-[-0.06em]">
              {pageTitle}
            </h1>
            <p className="mt-6 max-w-[550px] text-sm leading-[1.8] text-[#13251a]/55 dark:text-white/45 sm:text-[15px]">
              {pageSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#0f3d25] px-6 py-3 text-xs font-semibold text-[#f7f3e9] transition-colors hover:bg-[#14532d] dark:bg-[#d9f99d] dark:text-[#0f3d25] dark:hover:bg-white"
              >
                {t('about.ctaButton')}
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#0f3d25]/20 px-6 py-3 text-xs font-semibold text-[#13251a]/70 transition-colors hover:border-[#0f3d25] hover:text-[#0f3d25] dark:border-white/20 dark:text-white/55 dark:hover:border-white/40 dark:hover:text-white"
              >
                {t('about.secondaryCta')}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 30, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease }}
            className="relative overflow-hidden rounded-[30px] border border-[#0f3d25] bg-[#0f3d25] p-7 text-[#f7f3e9] shadow-[12px_14px_0_rgba(15,61,37,0.12)] dark:border-white/10 dark:bg-[#0b1710] dark:shadow-[12px_14px_0_rgba(0,0,0,0.2)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border border-[#f7f3e9]/10 dark:border-white/10"
            />
            <Quote className="size-8 text-[#d9f99d]/40 dark:text-brand-200/30" />
            <p className="relative mt-7 font-serif text-[34px] leading-[1.02] tracking-[-0.045em]">
              {t('about.note')}
            </p>
            <div className="relative mt-8 flex items-center justify-between gap-4 border-t border-[#f7f3e9]/15 pt-4 dark:border-white/10">
              <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#f7f3e9]/40 dark:text-white/30">
                {t('about.stamp')}
              </span>
              <span className="flex size-9 items-center justify-center rounded-full bg-[#d9f99d] text-[#0f3d25] dark:bg-[#d9f99d]">
                <Sprout className="size-4" />
              </span>
            </div>
          </motion.aside>
        </div>

        <div className="grid grid-cols-2 border-b border-[#0f3d25]/10 dark:border-white/10 sm:grid-cols-4">
          {dynamicStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + index * 0.06 }}
              className={`py-6 ${
                index > 0 ? 'border-l border-[#0f3d25]/10 pl-5 dark:border-white/10' : ''
              } ${index > 1 ? 'border-t sm:border-t-0' : ''} ${
                index === 2 ? 'sm:border-l' : ''
              }`}
            >
              <p className="font-serif text-[34px] leading-none tracking-[-0.05em] sm:text-[42px]">
                {stat.value}
              </p>
              <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#13251a]/40 dark:text-white/30">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <section className="grid gap-8 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/45 dark:text-brand-200/40">
              {t('about.missionLabel')}
            </p>
            <h2 className="mt-3 font-serif text-[clamp(2.4rem,4vw,4rem)] leading-[0.96] tracking-[-0.05em]">
              {t('about.missionTitle')}
            </h2>
          </div>
          <div className="flex flex-col justify-between gap-8">
            <p className="max-w-[520px] text-sm leading-[1.85] text-[#13251a]/55 dark:text-white/45 sm:text-[15px]">
              {t('about.missionBody')}
            </p>
            <div className="flex items-center gap-3 border-t border-[#0f3d25]/10 pt-4 dark:border-white/10">
              <span className="size-1.5 rounded-full bg-[#0f3d25] dark:bg-[#d9f99d]" />
              <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#13251a]/35 dark:text-white/25">
                {t('footer.madeIn')}
              </span>
              <span className="h-px flex-1 bg-[#0f3d25]/10 dark:bg-white/10" />
              <span className="font-serif text-lg text-[#0f3d25]/35 dark:text-white/25">01</span>
            </div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease }}
          className="relative overflow-hidden rounded-[30px] border border-[#0f3d25]/15 bg-[#fbf7ec] p-7 text-[#13251a] shadow-[12px_14px_0_rgba(15,61,37,0.05)] dark:border-white/[0.12] dark:bg-[#0b1710] dark:text-[#f2eee3] dark:shadow-[12px_14px_0_rgba(0,0,0,0.18)] sm:p-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border border-[#0f3d25]/10 dark:border-white/10"
          />
          <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/45 dark:text-brand-200/40">
                {t('about.storyLabel')}
              </p>
              <h2 className="mt-3 max-w-[380px] font-serif text-[clamp(2rem,3.5vw,3.3rem)] leading-[0.98] tracking-[-0.05em]">
                {t('about.storyTitle')}
              </h2>
            </div>
            <div>
              <p className="max-w-[500px] text-xs leading-[1.85] text-[#13251a]/55 dark:text-white/40 sm:text-sm">
                {t('about.storyBody')}
              </p>
              <div className="mt-7 flex items-center gap-3">
                <span className="rounded-full bg-[#0f3d25] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#d9f99d] dark:bg-[#d9f99d] dark:text-[#0f3d25]">
                  {t('about.farmLabel')}
                </span>
                <span className="h-px flex-1 border-t border-dashed border-[#0f3d25]/25 dark:border-white/20" />
                <span className="rounded-full border border-[#0f3d25]/20 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#0f3d25]/60 dark:border-white/20 dark:text-white/45">
                  {t('about.buyerLabel')}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="py-16">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/45 dark:text-brand-200/40">
                {t('about.valuesLabel')}
              </p>
              <h2 className="mt-3 max-w-[410px] font-serif text-[clamp(2.2rem,4vw,3.7rem)] leading-[0.96] tracking-[-0.05em]">
                {t('about.valuesTitle')}
              </h2>
            </div>
            <p className="max-w-[420px] text-xs leading-[1.8] text-[#13251a]/45 dark:text-white/35 lg:justify-self-end">
              {t('about.missionBody')}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dynamicValues.map((value, index) => {
              const style = valueStyles[index] || valueStyles[0]
              const Icon = style.icon
              return (
                <motion.article
                  key={value.title}
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
                    {value.title}
                  </h3>
                  <p className="mt-3 text-[10px] leading-[1.7] text-[#13251a]/55 dark:text-white/40">
                    {value.desc}
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
                {t('about.stamp')}
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-[1.02] tracking-[-0.045em] sm:text-4xl">
                {t('about.ctaTitle')}
              </h2>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-[#f7f3e9]/55 dark:text-white/40 sm:text-sm">
                {t('about.ctaSubtitle')}
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#d9f99d] px-6 py-3 text-xs font-semibold text-[#0f3d25] transition-colors hover:bg-white md:self-auto"
            >
              {t('about.ctaButton')}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </section>
    </PublicShell>
  )
}
