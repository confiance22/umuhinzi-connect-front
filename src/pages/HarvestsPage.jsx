import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Apple,
  ArrowRight,
  ArrowUpRight,
  Banana,
  Bean,
  Carrot,
  Cherry,
  Citrus,
  Leaf,
  MapPin,
  Package,
  Salad,
  Search,
  Sprout,
  Star,
  Users,
  Wheat
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PublicShell from '../components/public/PublicShell'
import { useLanguage } from '../context/LanguageContext'

const categories = ['all', 'vegetables', 'fruits', 'grains', 'legumes']

const harvests = [
  {
    nameKey: 'harvests.crops.maize',
    variety: 'Yellow maize',
    category: 'grains',
    farmer: 'Jean Bosco',
    district: 'Nyagatare',
    price: 450,
    quantity: '1.2 t',
    rating: 4.8,
    icon: Wheat,
    tone: 'from-amber-100 via-orange-50 to-white dark:from-amber-900/30 dark:via-orange-900/10 dark:to-transparent'
  },
  {
    nameKey: 'harvests.crops.beans',
    variety: 'Red kidney beans',
    category: 'legumes',
    farmer: 'Alice Mukamana',
    district: 'Musanze',
    price: 780,
    quantity: '800 kg',
    rating: 4.9,
    icon: Bean,
    tone: 'from-rose-100 via-red-50 to-white dark:from-rose-900/30 dark:via-red-900/10 dark:to-transparent'
  },
  {
    nameKey: 'harvests.crops.potatoes',
    variety: 'Kinigi variety',
    category: 'vegetables',
    farmer: 'Eric Nsengimana',
    district: 'Musanze',
    price: 320,
    quantity: '2 t',
    rating: 4.7,
    icon: Sprout,
    tone: 'from-emerald-100 via-green-50 to-white dark:from-emerald-900/30 dark:via-green-900/10 dark:to-transparent'
  },
  {
    nameKey: 'harvests.crops.tomatoes',
    variety: 'Fresh red tomatoes',
    category: 'vegetables',
    farmer: 'Claudine Uwase',
    district: 'Kigali',
    price: 600,
    quantity: '500 kg',
    rating: 4.6,
    icon: Cherry,
    tone: 'from-red-100 via-rose-50 to-white dark:from-red-900/30 dark:via-rose-900/10 dark:to-transparent'
  },
  {
    nameKey: 'harvests.crops.rice',
    variety: 'Paddy rice',
    category: 'grains',
    farmer: 'Emmanuel Habimana',
    district: 'Bugarama',
    price: 950,
    quantity: '1.5 t',
    rating: 4.8,
    icon: Wheat,
    tone: 'from-yellow-100 via-amber-50 to-white dark:from-yellow-900/30 dark:via-amber-900/10 dark:to-transparent'
  },
  {
    nameKey: 'harvests.crops.cassava',
    variety: 'Fresh cassava',
    category: 'vegetables',
    farmer: 'Joséphine Nyirahabimana',
    district: 'Huye',
    price: 280,
    quantity: '1 t',
    rating: 4.5,
    icon: Leaf,
    tone: 'from-lime-100 via-emerald-50 to-white dark:from-lime-900/30 dark:via-emerald-900/10 dark:to-transparent'
  },
  {
    nameKey: 'harvests.crops.onions',
    variety: 'Red onions',
    category: 'vegetables',
    farmer: 'Solange Ingabire',
    district: 'Huye',
    price: 520,
    quantity: '700 kg',
    rating: 4.7,
    icon: Salad,
    tone: 'from-fuchsia-100 via-pink-50 to-white dark:from-fuchsia-900/30 dark:via-pink-900/10 dark:to-transparent'
  },
  {
    nameKey: 'harvests.crops.avocado',
    variety: 'Hass avocado',
    category: 'fruits',
    farmer: 'Patrick Niyonsaba',
    district: 'Kayanza',
    price: 850,
    quantity: '600 kg',
    rating: 4.9,
    icon: Apple,
    tone: 'from-green-100 via-lime-50 to-white dark:from-green-900/30 dark:via-lime-900/10 dark:to-transparent'
  },
  {
    nameKey: 'harvests.crops.bananas',
    variety: 'Cooking bananas',
    category: 'fruits',
    farmer: 'Vestine Uwimana',
    district: 'Rwamagana',
    price: 350,
    quantity: '2.5 t',
    rating: 4.6,
    icon: Banana,
    tone: 'from-yellow-100 via-lime-50 to-white dark:from-yellow-900/30 dark:via-lime-900/10 dark:to-transparent'
  },
  {
    nameKey: 'harvests.crops.oranges',
    variety: 'Sweet oranges',
    category: 'fruits',
    farmer: 'Innocent Mugisha',
    district: 'Nyamasheke',
    price: 700,
    quantity: '900 kg',
    rating: 4.7,
    icon: Citrus,
    tone: 'from-orange-100 via-amber-50 to-white dark:from-orange-900/30 dark:via-amber-900/10 dark:to-transparent'
  },
  {
    nameKey: 'harvests.crops.cabbage',
    variety: 'Green cabbage',
    category: 'vegetables',
    farmer: 'Diane Mukandayisenga',
    district: 'Rubavu',
    price: 250,
    quantity: '1.4 t',
    rating: 4.4,
    icon: Salad,
    tone: 'from-emerald-100 via-teal-50 to-white dark:from-emerald-900/30 dark:via-teal-900/10 dark:to-transparent'
  },
  {
    nameKey: 'harvests.crops.carrots',
    variety: 'Fresh carrots',
    category: 'vegetables',
    farmer: 'Olivier Nkurunziza',
    district: 'Nyabihu',
    price: 400,
    quantity: '750 kg',
    rating: 4.8,
    icon: Carrot,
    tone: 'from-orange-100 via-amber-50 to-white dark:from-orange-900/30 dark:via-amber-900/10 dark:to-transparent'
  }
]

const stats = [
  { value: '1,240+', labelKey: 'harvests.stats.farmers', icon: Users },
  { value: '30', labelKey: 'harvests.stats.districts', icon: MapPin },
  { value: '24', labelKey: 'harvests.stats.crops', icon: Sprout }
]

export default function HarvestsPage() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredHarvests = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return harvests.filter((harvest) => {
      const matchesCategory =
        activeCategory === 'all' || harvest.category === activeCategory
      const haystack = `${t(harvest.nameKey)} ${harvest.variety} ${harvest.farmer} ${harvest.district}`.toLowerCase()
      return matchesCategory && (!needle || haystack.includes(needle))
    })
  }, [activeCategory, query, t])

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
            {t('harvests.badge')}
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink dark:text-white sm:text-4xl md:text-5xl">
            {t('harvests.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted dark:text-gray-400 sm:text-base">
            {t('harvests.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="mt-10 grid gap-3 sm:grid-cols-3"
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.labelKey}
                className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white/80 p-5 shadow-[0_18px_45px_-34px_rgba(5,46,22,0.3)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-xl font-bold text-ink dark:text-white">{stat.value}</p>
                  <p className="text-xs text-muted dark:text-gray-400">{t(stat.labelKey)}</p>
                </div>
              </div>
            )
          })}
        </motion.div>

        <div className="mt-8 rounded-3xl border border-black/5 bg-white/80 p-3 shadow-[0_20px_55px_-38px_rgba(5,46,22,0.35)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted dark:text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('harvests.searchPlaceholder')}
                className="h-12 w-full rounded-full border border-black/5 bg-white pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                    activeCategory === category
                      ? 'bg-brand-600 text-white shadow-[0_8px_20px_-12px_rgba(22,163,74,0.9)]'
                      : 'border border-black/5 bg-white text-muted hover:border-brand-500/30 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-brand-300'
                  }`}
                >
                  {t(`harvests.categories.${category}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredHarvests.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHarvests.map((harvest, index) => {
              const Icon = harvest.icon
              return (
                <motion.article
                  key={harvest.nameKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
                  whileHover={{ y: -4 }}
                  className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_18px_45px_-32px_rgba(5,46,22,0.28)] transition-shadow hover:shadow-[0_24px_60px_-34px_rgba(5,46,22,0.36)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
                >
                  <div className={`relative aspect-[4/3] bg-gradient-to-br ${harvest.tone}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon
                        className="size-16 text-brand-700/70 transition-transform duration-300 group-hover:scale-110 dark:text-brand-300/70"
                        strokeWidth={1.2}
                      />
                    </div>
                    <span className="absolute left-4 top-4 rounded-full border border-brand-500/20 bg-white/90 px-3 py-1 text-[11px] font-semibold text-brand-800 backdrop-blur dark:border-brand-400/20 dark:bg-black/40 dark:text-brand-200">
                      {t(`harvests.categories.${harvest.category}`)}
                    </span>
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur dark:bg-black/40 dark:text-white">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {harvest.rating}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-ink dark:text-white">
                          {t(harvest.nameKey)}
                        </h3>
                        <p className="mt-1 truncate text-xs text-muted dark:text-gray-400">
                          {harvest.variety}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-bold text-brand-700 dark:text-brand-300">
                          {harvest.price.toLocaleString()}{' '}
                          <span className="text-xs font-medium">RWF</span>
                        </p>
                        <p className="text-[11px] text-muted dark:text-gray-400">
                          {t('common.perKg')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-muted dark:text-gray-400">
                      <p className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        {harvest.district}
                      </p>
                      <p className="inline-flex items-center gap-1.5">
                        <Package className="size-3.5" />
                        {harvest.quantity} {t('harvests.available')}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/5 pt-4 dark:border-white/10">
                      <span className="min-w-0 truncate text-xs text-muted dark:text-gray-400">
                        {t('harvests.from')}{' '}
                        <span className="font-medium text-ink dark:text-white">
                          {harvest.farmer}
                        </span>
                      </span>
                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-600 hover:text-white dark:text-brand-300 dark:hover:text-white"
                      >
                        {t('harvests.viewHarvest')}
                        <ArrowUpRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-black/10 bg-white/60 p-12 text-center dark:border-white/10 dark:bg-white/[0.03]">
            <Search className="mx-auto size-8 text-brand-500" />
            <h3 className="mt-4 text-lg font-semibold text-ink dark:text-white">
              {t('harvests.noResults')}
            </h3>
            <p className="mt-2 text-sm text-muted dark:text-gray-400">
              {t('harvests.noResultsHint')}
            </p>
          </div>
        )}

        <section className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-[0_30px_80px_-40px_rgba(22,163,74,0.65)] sm:p-12">
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">{t('harvests.ctaTitle')}</h2>
              <p className="mt-3 max-w-xl text-sm text-brand-50/90">{t('harvests.ctaSubtitle')}</p>
            </div>
            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('harvests.ctaButton')}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </section>
    </PublicShell>
  )
}
