import { Apple, ArrowRight, Bean, Sprout, Wheat } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Title from './Title'

const categories = [
  {
    label: 'Vegetables',
    icon: Sprout,
    tone: 'from-emerald-800 to-emerald-600',
    detail: 'Leafy greens, tomatoes, onions and more'
  },
  {
    label: 'Fruits',
    icon: Apple,
    tone: 'from-amber-800 to-amber-600',
    detail: 'Avocado, bananas, citrus and seasonal fruit'
  },
  {
    label: 'Grains',
    icon: Wheat,
    tone: 'from-yellow-800 to-yellow-600',
    detail: 'Maize, rice and other staple grains'
  },
  {
    label: 'Legumes',
    icon: Bean,
    tone: 'from-rose-900 to-rose-700',
    detail: 'Beans, peas and protein-rich pulses'
  }
]

export default function Categories() {
  return (
    <section className="border-t border-black/5 bg-white/60 py-20 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-6xl px-4">
        <Title
          title="Marketplace"
          heading="Browse by category"
          description="Find the produce you need, or list the harvest you are ready to sell."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {categories.map((category) => (
            <motion.div
              key={category.label}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.97 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 110, damping: 16 }
                }
              }}
              className="h-full"
            >
              <Link
                to="/harvests"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_18px_50px_-38px_rgba(5,46,22,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-[0_24px_60px_-34px_rgba(5,46,22,0.45)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
              >
                <div
                  className={`relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br ${category.tone}`}
                >
                  <div className="absolute -bottom-7 -right-4 h-24 w-24 rounded-full bg-white/10" />
                  <div className="absolute -left-4 top-4 h-16 w-16 rounded-full bg-white/[0.08]" />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                    <category.icon size={24} strokeWidth={1.7} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between gap-3 px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-ink dark:text-white">
                      {category.label}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted dark:text-gray-400">
                      {category.detail}
                    </p>
                  </div>
                  <span className="flex items-center justify-between text-[11px] font-medium text-brand-700 dark:text-brand-300">
                    Explore
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
