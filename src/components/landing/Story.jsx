import { ArrowUpRight, Check, TrendingDown, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

export default function Story() {
  const { t } = useLanguage()
  const points = t('landing.story.points')
  const prices = t('landing.story.prices')

  return (
    <section className="border-y border-black/5 bg-white/60 py-20 dark:border-white/10 dark:bg-white/[0.02] 2xl:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
            {t('landing.story.mission')}
          </p>
          <h2 className="max-w-lg text-3xl font-semibold tracking-[-0.03em] text-ink dark:text-white md:text-[2.5rem] md:leading-[1.12]">
            {t('landing.story.heading')}
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-[1.75] text-muted dark:text-gray-400">
            {t('landing.story.description')}
          </p>

          <ul className="mt-7 space-y-3.5">
            {points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-sm text-ink/80 dark:text-gray-300"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300">
                  <Check size={12} strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-500/10 via-transparent to-transparent blur-2xl" />
          <div className="overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-[0_30px_80px_-45px_rgba(5,46,22,0.4)] dark:border-white/10 dark:bg-[#07160d] dark:shadow-black/40">
            <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-5 dark:border-white/10">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:text-gray-500">
                  {t('landing.story.snapshot')}
                </p>
                <h3 className="mt-1 text-base font-semibold text-ink dark:text-white">
                  {t('landing.story.snapshotTitle')}
                </h3>
              </div>
              <span className="rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
                {t('landing.story.daily')}
              </span>
            </div>

            <div className="divide-y divide-black/5 dark:divide-white/10">
              {prices.map((item) => (
                <div key={item.crop} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink dark:text-white">{item.crop}</p>
                    <p className="mt-0.5 text-[10px] text-muted dark:text-gray-500">
                      {item.district}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink dark:text-white">
                      RWF {item.price}
                      <span className="ml-1 text-[10px] font-normal text-muted dark:text-gray-500">
                        {t('landing.hero.unit')}
                      </span>
                    </p>
                    <p
                      className={`mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium ${
                        item.up ? 'text-brand-600 dark:text-brand-300' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {item.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/market-prices"
              className="mt-2 flex items-center justify-between rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 text-xs font-medium text-ink/70 transition-colors hover:border-brand-500/30 hover:text-brand-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/65 dark:hover:border-brand-400/30 dark:hover:text-brand-300"
            >
              {t('landing.story.explorePrices')}
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
