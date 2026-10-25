import { ShieldCheck, Sprout, TrendingUp, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import Title from './Title'
import { useLanguage } from '../../context/LanguageContext'

const featureIcons = [Sprout, TrendingUp, Truck, ShieldCheck]

export default function Features() {
  const { t } = useLanguage()
  const features = t('landing.features.items')

  return (
    <section id="features" className="py-20 2xl:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Title
          title={t('landing.features.title')}
          heading={t('landing.features.heading')}
          description={t('landing.features.description')}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => {
            const Icon = featureIcons[index]

            return (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                  }
                }}
                className="group h-full rounded-2xl border border-black/5 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(5,46,22,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-[0_24px_60px_-34px_rgba(5,46,22,0.45)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-[0_12px_30px_-14px_rgba(22,163,74,0.8)] transition-transform duration-300 group-hover:scale-105">
                  <Icon size={19} strokeWidth={1.8} />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-ink dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-[1.6] text-muted dark:text-gray-400">
                  {feature.desc}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
