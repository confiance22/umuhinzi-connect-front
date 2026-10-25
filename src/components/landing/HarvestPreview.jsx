import { ArrowRight, Bean, Leaf, MapPin, Sprout, Wheat } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Title from './Title'

const harvests = [
  {
    crop: 'Maize',
    variety: 'Yellow maize',
    farmer: 'Jean Bosco',
    district: 'Nyagatare',
    price: '450',
    quantity: '1.2 t available',
    icon: Wheat,
    tone: 'from-amber-100 via-orange-50 to-white dark:from-amber-900/40 dark:via-orange-900/10 dark:to-transparent'
  },
  {
    crop: 'Beans',
    variety: 'Red kidney beans',
    farmer: 'Alice Mukamana',
    district: 'Musanze',
    price: '780',
    quantity: '800 kg available',
    icon: Bean,
    tone: 'from-rose-100 via-red-50 to-white dark:from-rose-900/40 dark:via-red-900/10 dark:to-transparent'
  },
  {
    crop: 'Irish potatoes',
    variety: 'Kinigi variety',
    farmer: 'Eric Nsengimana',
    district: 'Musanze',
    price: '320',
    quantity: '2 t available',
    icon: Sprout,
    tone: 'from-emerald-100 via-green-50 to-white dark:from-emerald-900/40 dark:via-green-900/10 dark:to-transparent'
  },
  {
    crop: 'Avocado',
    variety: 'Hass avocado',
    farmer: 'Patrick Niyonsaba',
    district: 'Kayanza',
    price: '850',
    quantity: '600 kg available',
    icon: Leaf,
    tone: 'from-lime-100 via-emerald-50 to-white dark:from-lime-900/40 dark:via-emerald-900/10 dark:to-transparent'
  }
]

export default function HarvestPreview() {
  return (
    <section className="py-20 2xl:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Title
          title="Fresh from the farm"
          heading="Harvests ready for the market"
          description="A preview of the produce farmers are listing right now. Browse everything on the marketplace."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {harvests.map((harvest) => (
            <motion.div
              key={harvest.crop}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
                }
              }}
              className="h-full"
            >
              <Link
                to="/harvests"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_18px_50px_-38px_rgba(5,46,22,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-[0_24px_60px_-34px_rgba(5,46,22,0.45)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
              >
                <div
                  className={`relative flex h-32 items-center justify-between overflow-hidden bg-gradient-to-br ${harvest.tone} p-5`}
                >
                  <div className="absolute -bottom-6 -right-3 size-20 rounded-full bg-white/40 dark:bg-white/[0.04]" />
                  <harvest.icon
                    size={34}
                    strokeWidth={1.6}
                    className="relative text-[#183a25] dark:text-brand-200"
                  />
                  <span className="relative rounded-full border border-black/5 bg-white/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#183a25]/70 backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:text-white/70">
                    Available
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-[15px] font-semibold text-ink dark:text-white">
                    {harvest.crop}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-muted dark:text-gray-400">
                    {harvest.variety}
                  </p>

                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted dark:text-gray-400">
                    <MapPin size={12} className="text-brand-600 dark:text-brand-300" />
                    {harvest.district}
                    <span className="text-black/15 dark:text-white/15">•</span>
                    {harvest.farmer}
                  </p>

                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-black/5 pt-4 dark:border-white/10">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-semibold tracking-tight text-ink dark:text-white">
                          RWF {harvest.price}
                        </span>
                        <span className="text-[10px] text-muted dark:text-gray-500">/ kg</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted dark:text-gray-500">
                        {harvest.quantity}
                      </p>
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10 text-brand-700 transition-all duration-300 group-hover:bg-brand-600 group-hover:text-white dark:text-brand-300">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <Link
            to="/harvests"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-ink shadow-sm transition-colors hover:border-brand-500/40 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-brand-400/40 dark:hover:text-brand-300"
          >
            View all harvests
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
