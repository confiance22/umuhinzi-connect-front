import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Apple,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banana,
  Bean,
  Carrot,
  Cherry,
  ChevronDown,
  Citrus,
  Leaf,
  Loader2,
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
import harvestApi from '../api/harvestApi'

function getCropIcon(cropName = '') {
  const c = String(cropName).toLowerCase()
  if (c.includes('maize') || c.includes('rice') || c.includes('wheat') || c.includes('grain')) return Wheat
  if (c.includes('bean') || c.includes('legume') || c.includes('pea')) return Bean
  if (c.includes('potato') || c.includes('sweet')) return Sprout
  if (c.includes('tomato') || c.includes('cherry') || c.includes('pepper')) return Cherry
  if (c.includes('onion') || c.includes('cabbage') || c.includes('lettuce')) return Salad
  if (c.includes('avocado') || c.includes('apple')) return Apple
  if (c.includes('banana') || c.includes('plantain')) return Banana
  if (c.includes('orange') || c.includes('citrus') || c.includes('lemon')) return Citrus
  if (c.includes('carrot')) return Carrot
  if (c.includes('cassava') || c.includes('leaf') || c.includes('spinach')) return Leaf
  return Sprout
}

const categories = ['all', 'vegetables', 'fruits', 'grains', 'legumes']

const categoryTheme = {
  vegetables: {
    art: 'bg-[#e7efda] dark:bg-[#10261a]',
    ink: 'text-[#0f3d25] dark:text-[#d9f99d]',
    chip: 'bg-[#0f3d25] text-[#fbf7ec] dark:bg-[#d9f99d] dark:text-[#0f3d25]',
    dot: 'bg-[#0f3d25] dark:bg-[#d9f99d]'
  },
  fruits: {
    art: 'bg-[#f4e3c9] dark:bg-[#2a1e10]',
    ink: 'text-[#7a3d1f] dark:text-[#f4c58c]',
    chip: 'bg-[#7a3d1f] text-[#fbf7ec] dark:bg-[#f4c58c] dark:text-[#2a1e10]',
    dot: 'bg-[#a4472b] dark:bg-[#f4c58c]'
  },
  grains: {
    art: 'bg-[#f1e8c7] dark:bg-[#251f0d]',
    ink: 'text-[#6b4b10] dark:text-[#efd47d]',
    chip: 'bg-[#6b4b10] text-[#fbf7ec] dark:bg-[#efd47d] dark:text-[#251f0d]',
    dot: 'bg-[#a97a17] dark:bg-[#efd47d]'
  },
  legumes: {
    art: 'bg-[#eeded7] dark:bg-[#291715]',
    ink: 'text-[#6d2f32] dark:text-[#f0a6a0]',
    chip: 'bg-[#6d2f32] text-[#fbf7ec] dark:bg-[#f0a6a0] dark:text-[#291715]',
    dot: 'bg-[#8f3c3c] dark:bg-[#f0a6a0]'
  }
}

const harvests = [
  {
    lot: 'UC-01',
    nameKey: 'harvests.crops.maize',
    variety: 'Yellow maize',
    category: 'grains',
    farmer: 'Jean Bosco',
    district: 'Nyagatare',
    price: 450,
    quantity: '1.2 t',
    rating: 4.8,
    icon: Wheat
  },
  {
    lot: 'UC-02',
    nameKey: 'harvests.crops.beans',
    variety: 'Red kidney beans',
    category: 'legumes',
    farmer: 'Alice Mukamana',
    district: 'Musanze',
    price: 780,
    quantity: '800 kg',
    rating: 4.9,
    icon: Bean
  },
  {
    lot: 'UC-03',
    nameKey: 'harvests.crops.potatoes',
    variety: 'Kinigi variety',
    category: 'vegetables',
    farmer: 'Eric Nsengimana',
    district: 'Musanze',
    price: 320,
    quantity: '2 t',
    rating: 4.7,
    icon: Sprout
  },
  {
    lot: 'UC-04',
    nameKey: 'harvests.crops.tomatoes',
    variety: 'Fresh red tomatoes',
    category: 'vegetables',
    farmer: 'Claudine Uwase',
    district: 'Kigali',
    price: 600,
    quantity: '500 kg',
    rating: 4.6,
    icon: Cherry
  },
  {
    lot: 'UC-05',
    nameKey: 'harvests.crops.rice',
    variety: 'Paddy rice',
    category: 'grains',
    farmer: 'Emmanuel Habimana',
    district: 'Bugarama',
    price: 950,
    quantity: '1.5 t',
    rating: 4.8,
    icon: Wheat
  },
  {
    lot: 'UC-06',
    nameKey: 'harvests.crops.cassava',
    variety: 'Fresh cassava',
    category: 'vegetables',
    farmer: 'Joséphine Nyirahabimana',
    district: 'Huye',
    price: 280,
    quantity: '1 t',
    rating: 4.5,
    icon: Leaf
  },
  {
    lot: 'UC-07',
    nameKey: 'harvests.crops.onions',
    variety: 'Red onions',
    category: 'vegetables',
    farmer: 'Solange Ingabire',
    district: 'Huye',
    price: 520,
    quantity: '700 kg',
    rating: 4.7,
    icon: Salad
  },
  {
    lot: 'UC-08',
    nameKey: 'harvests.crops.avocado',
    variety: 'Hass avocado',
    category: 'fruits',
    farmer: 'Patrick Niyonsaba',
    district: 'Kayanza',
    price: 850,
    quantity: '600 kg',
    rating: 4.9,
    icon: Apple
  },
  {
    lot: 'UC-09',
    nameKey: 'harvests.crops.bananas',
    variety: 'Cooking bananas',
    category: 'fruits',
    farmer: 'Vestine Uwimana',
    district: 'Rwamagana',
    price: 350,
    quantity: '2.5 t',
    rating: 4.6,
    icon: Banana
  },
  {
    lot: 'UC-10',
    nameKey: 'harvests.crops.oranges',
    variety: 'Sweet oranges',
    category: 'fruits',
    farmer: 'Innocent Mugisha',
    district: 'Nyamasheke',
    price: 700,
    quantity: '900 kg',
    rating: 4.7,
    icon: Citrus
  },
  {
    lot: 'UC-11',
    nameKey: 'harvests.crops.cabbage',
    variety: 'Green cabbage',
    category: 'vegetables',
    farmer: 'Diane Mukandayisenga',
    district: 'Rubavu',
    price: 250,
    quantity: '1.4 t',
    rating: 4.4,
    icon: Salad
  },
  {
    lot: 'UC-12',
    nameKey: 'harvests.crops.carrots',
    variety: 'Fresh carrots',
    category: 'vegetables',
    farmer: 'Olivier Nkurunziza',
    district: 'Nyabihu',
    price: 400,
    quantity: '750 kg',
    rating: 4.8,
    icon: Carrot
  }
]

const stats = [
  { value: '1,240+', labelKey: 'harvests.stats.farmers', icon: Users },
  { value: '30', labelKey: 'harvests.stats.districts', icon: MapPin },
  { value: '24', labelKey: 'harvests.stats.crops', icon: Sprout }
]

function initialsOf(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
}

function HarvestCard({ harvest, featured, t }) {
  const Icon = harvest.icon
  const theme = categoryTheme[harvest.category] || categoryTheme.vegetables

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-[#0f3d25]/15 bg-[#fbf7ec] text-[#13251a] shadow-[10px_12px_0_rgba(15,61,37,0.045)] transition-shadow hover:shadow-[12px_16px_0_rgba(15,61,37,0.07)] dark:border-white/[0.12] dark:bg-[#0b1710] dark:text-[#f2eee3] dark:shadow-[10px_12px_0_rgba(0,0,0,0.18)] ${
        featured ? 'sm:col-span-2' : ''
      }`}
    >
      <div className={featured ? 'grid h-full sm:grid-cols-[0.92fr_1.08fr]' : 'flex h-full flex-col'}>
        <div
          className={`relative overflow-hidden ${theme.art} ${
            featured ? 'min-h-[230px] p-6 sm:min-h-[340px]' : 'aspect-[4/3] p-5'
          }`}
        >
          <div className="relative z-10 flex items-start justify-between gap-2">
            <span className="rounded-full border border-[#0f3d25]/15 bg-[#fbf7ec]/75 px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.15em] text-[#0f3d25]/65 dark:border-white/15 dark:bg-white/5 dark:text-white/45">
              {t('harvests.lot')} {harvest.lot}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.12em] ${
                featured ? 'bg-[#0f3d25] text-[#d9f99d] dark:bg-[#d9f99d] dark:text-[#0f3d25]' : 'bg-[#fbf7ec]/80 text-[#0f3d25]/55 dark:bg-white/5 dark:text-white/40'
              }`}
            >
              {featured ? t('harvests.featuredLot') : t(`harvests.categories.${harvest.category}`)}
            </span>
          </div>

          <div className={`flex items-center justify-center ${featured ? 'mt-10' : 'mt-4'}`}>
            <div
              className={`relative flex items-center justify-center rounded-full border border-[#0f3d25]/15 bg-[#fbf7ec]/35 dark:border-white/10 dark:bg-white/[0.035] ${
                featured ? 'size-44' : 'size-28'
              }`}
            >
              <div className="absolute inset-3 rounded-full border border-dashed border-[#0f3d25]/15 dark:border-white/10" />
              <Icon
                className={`${theme.ink} transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${
                  featured ? 'size-24' : 'size-14'
                }`}
                strokeWidth={featured ? 0.9 : 1.2}
              />
              <span className="absolute -right-2 bottom-5 inline-flex items-center gap-1 rounded-full border border-[#0f3d25]/15 bg-[#fbf7ec] px-2 py-1 text-[8px] font-semibold text-[#13251a] shadow-sm dark:border-white/10 dark:bg-[#0b1710] dark:text-white">
                <Star className="size-2.5 fill-amber-400 text-amber-400" />
                {harvest.rating}
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-5 flex items-center justify-between text-[7px] font-semibold uppercase tracking-[0.14em] text-[#0f3d25]/45 dark:text-white/35">
            <span>{t('harvests.origin')}</span>
            <span className="inline-flex items-center gap-1">
              <span className={`size-1.5 rounded-full ${theme.dot}`} />
              {harvest.district}
            </span>
          </div>
        </div>

        <div className={`flex flex-1 flex-col ${featured ? 'p-6 sm:p-8' : 'p-5'}`}>
          <div className="flex items-center justify-between gap-3 text-[7px] font-semibold uppercase tracking-[0.14em] text-[#13251a]/40 dark:text-white/35">
            <span>{t(`harvests.categories.${harvest.category}`)}</span>
            <span>{t('harvests.availableNow')}</span>
          </div>

          <h3
            className={`mt-3 font-serif leading-[0.92] tracking-[-0.045em] ${
              featured ? 'text-[38px] sm:text-[50px]' : 'text-[29px]'
            }`}
          >
            {harvest.nameKey?.startsWith('harvests.crops.') ? t(harvest.nameKey) : (harvest.cropName || harvest.nameKey)}
          </h3>
          <p className="mt-2 text-[11px] text-[#13251a]/50 dark:text-white/40">{harvest.variety}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#0f3d25]/10 px-2.5 py-1 text-[8px] text-[#13251a]/55 dark:border-white/10 dark:text-white/40">
              <MapPin className="size-3" />
              {harvest.district}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#0f3d25]/10 px-2.5 py-1 text-[8px] text-[#13251a]/55 dark:border-white/10 dark:text-white/40">
              <Package className="size-3" />
              {harvest.quantity}
            </span>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0f3d25] text-[8px] font-bold text-[#d9f99d] dark:bg-[#d9f99d] dark:text-[#0f3d25]">
              {initialsOf(harvest.farmer)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium">{harvest.farmer}</p>
              <p className="inline-flex items-center gap-1 text-[7px] uppercase tracking-[0.12em] text-[#13251a]/35 dark:text-white/30">
                <BadgeCheck className="size-2.5" />
                {t('harvests.verifiedGrower')}
              </p>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#0f3d25]/10 pt-5 dark:border-white/10">
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-[#13251a]/35 dark:text-white/30">
                {t('landing.hero.farmGate')}
              </p>
              <p className="mt-1 flex items-baseline gap-1">
                <span className={`font-serif leading-none tracking-[-0.04em] ${featured ? 'text-[34px]' : 'text-[27px]'}`}>
                  {harvest.price.toLocaleString()}
                </span>
                <span className="text-[9px] text-[#13251a]/40 dark:text-white/30">RWF</span>
              </p>
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#0f3d25]/15 px-3 py-2 text-[9px] font-semibold transition-colors hover:border-[#0f3d25] hover:bg-[#0f3d25] hover:text-[#fbf7ec] dark:border-white/15 dark:hover:border-[#d9f99d] dark:hover:bg-[#d9f99d] dark:hover:text-[#0f3d25]"
            >
              {t('harvests.viewLot')}
              <ArrowUpRight className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function HarvestsPage() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sort, setSort] = useState('featured')
  const [liveItems, setLiveItems] = useState(null)
  const [liveStats, setLiveStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let active = true
    const fetchHarvests = async () => {
      try {
        setIsLoading(true)
        const [harvestsRes, statsRes] = await Promise.all([
          harvestApi.listPublic({
            category: activeCategory !== 'all' ? activeCategory : undefined,
            search: query.trim() || undefined,
            sort:
              sort === 'price-low'
                ? 'price_asc'
                : sort === 'price-high'
                  ? 'price_desc'
                  : sort === 'rating'
                    ? 'quantity_desc'
                    : 'newest',
            limit: 30
          }),
          harvestApi.getPublicStats().catch(() => null)
        ])

        if (!active) return
        if (harvestsRes?.items) {
          setLiveItems(
            harvestsRes.items.map((item) => ({
              lot: item.lot || `UC-${String(item.id).slice(0, 4).toUpperCase()}`,
              cropName: item.crop_name,
              nameKey: item.crop_name,
              variety: item.variety || item.crop_name,
              category: item.category || 'vegetables',
              farmer: item.farmer_name || item.farmer || 'Farmer',
              district: item.district,
              price: item.price_per_kg || item.price,
              quantity: item.quantity_kg ? `${item.quantity_kg} kg` : item.quantity,
              rating: item.rating || 4.8,
              icon: getCropIcon(item.crop_name)
            }))
          )
        }
        if (statsRes) {
          setLiveStats(statsRes)
        }
      } catch (err) {
        console.warn('Falling back to default harvest directory:', err.message)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    const timer = setTimeout(fetchHarvests, 200)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [activeCategory, query, sort])

  const allHarvests = liveItems || harvests

  const filteredHarvests = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const items = allHarvests.filter((harvest) => {
      const matchesCategory = activeCategory === 'all' || harvest.category === activeCategory
      const localizedName = harvest.nameKey?.startsWith('harvests.crops.')
        ? t(harvest.nameKey)
        : harvest.cropName || harvest.nameKey
      const haystack = `${localizedName} ${harvest.variety} ${harvest.farmer} ${harvest.district}`.toLowerCase()
      return matchesCategory && (!needle || haystack.includes(needle))
    })

    if (sort === 'price-low') return [...items].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') return [...items].sort((a, b) => b.price - a.price)
    if (sort === 'rating') return [...items].sort((a, b) => b.rating - a.rating)
    return items
  }, [allHarvests, activeCategory, query, sort, t])

  const dynamicStats = useMemo(() => {
    if (liveStats) {
      return [
        { value: `${Number(liveStats.activeFarmers).toLocaleString()}+`, labelKey: 'harvests.stats.farmers', icon: Users },
        { value: String(liveStats.activeDistricts), labelKey: 'harvests.stats.districts', icon: MapPin },
        { value: String(liveStats.activeCrops), labelKey: 'harvests.stats.crops', icon: Sprout }
      ]
    }
    return stats
  }, [liveStats])

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  return (
    <PublicShell>
      <section data-hero className="mx-auto max-w-[1180px]">
        <div className="grid gap-8 border-b border-[#0f3d25]/10 pb-10 dark:border-white/10 lg:grid-cols-[1fr_350px] lg:items-end lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-wrap items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.16em]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d9f99d] px-3 py-1.5 text-[#0f3d25] dark:bg-[#d9f99d]/15 dark:text-[#d9f99d]">
                <span className="size-1.5 animate-pulse rounded-full bg-[#0f3d25] dark:bg-[#d9f99d]" />
                {t('harvests.boardLabel')}
              </span>
              <span className="text-[#13251a]/35 dark:text-white/30">{today}</span>
            </div>

            <h1 className="mt-6 max-w-[760px] font-serif text-[clamp(3.1rem,7vw,6.1rem)] leading-[0.88] tracking-[-0.06em]">
              {t('harvests.title')}
            </h1>
            <p className="mt-6 max-w-[540px] text-sm leading-[1.8] text-[#13251a]/55 dark:text-white/45 sm:text-[15px]">
              {t('harvests.subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#harvest-board"
                className="inline-flex items-center gap-2 rounded-full bg-[#0f3d25] px-6 py-3 text-xs font-semibold text-[#f7f3e9] transition-colors hover:bg-[#14532d] dark:bg-[#d9f99d] dark:text-[#0f3d25] dark:hover:bg-white"
              >
                {t('harvests.boardTitle')}
                <ArrowDown className="size-3.5" />
              </a>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full border border-[#0f3d25]/20 px-6 py-3 text-xs font-semibold text-[#13251a]/70 transition-colors hover:border-[#0f3d25] hover:text-[#0f3d25] dark:border-white/20 dark:text-white/55 dark:hover:border-white/40 dark:hover:text-white"
              >
                {t('harvests.ctaButton')}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 30, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[28px] border border-[#0f3d25]/15 bg-[#fbf7ec] p-5 text-[#13251a] shadow-[10px_12px_0_rgba(15,61,37,0.06)] dark:border-white/[0.12] dark:bg-[#0b1710] dark:text-[#f2eee3] dark:shadow-[10px_12px_0_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center justify-between gap-4 text-[7px] font-semibold uppercase tracking-[0.16em] text-[#13251a]/40 dark:text-white/35">
              <span>{t('harvests.harvestIndex')}</span>
              <span>{today}</span>
            </div>

            <div className="mt-5 flex items-end gap-3">
              <p className="font-serif text-[76px] leading-[0.72] tracking-[-0.07em]">
                {String(allHarvests.length).padStart(2, '0')}
              </p>
              <p className="mb-1 text-[9px] uppercase leading-[1.5] tracking-[0.14em] text-[#13251a]/40 dark:text-white/35">
                {t('harvests.results')}
                <br />
                {t('harvests.availableNow')}
              </p>
            </div>

            <div className="mt-6 divide-y divide-[#0f3d25]/10 border-y border-[#0f3d25]/10 dark:divide-white/10 dark:border-white/10">
              {dynamicStats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.labelKey} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-[9px] text-[#13251a]/55 dark:text-white/40">
                      <Icon className="size-3.5" />
                      {t(stat.labelKey)}
                    </span>
                    <span className="font-serif text-lg leading-none">{stat.value}</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 rounded-[18px] bg-[#0f3d25] p-4 text-[#f7f3e9] dark:bg-[#d9f99d] dark:text-[#0f3d25]">
              <p className="text-[8px] font-semibold uppercase tracking-[0.16em] opacity-55">
                {t('harvests.boardNote')}
              </p>
              <p className="mt-2 font-serif text-[17px] leading-[1.25]">{t('harvests.everyLot')}</p>
            </div>
          </motion.aside>
        </div>

        <section id="harvest-board" className="scroll-mt-28 pt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/45 dark:text-brand-200/40">
                {t('harvests.boardLabel')}
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.045em] sm:text-4xl">
                {t('harvests.boardTitle')}
              </h2>
            </div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#13251a]/35 dark:text-white/30">
              {filteredHarvests.length} {t('harvests.results')} · {t('harvests.boardSubtitle')}
            </p>
          </div>

          <div className="sticky top-[74px] z-30 mt-5 rounded-[22px] border border-[#0f3d25]/10 bg-[#f6f1e6]/90 p-2.5 shadow-[0_18px_45px_-34px_rgba(15,61,37,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-[#07100a]/90 dark:shadow-none">
            <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#13251a]/35 dark:text-white/30" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('harvests.searchPlaceholder')}
                  className="h-11 w-full rounded-full border border-[#0f3d25]/10 bg-[#fbf7ec] pl-11 pr-4 text-xs text-[#13251a] outline-none transition-colors placeholder:text-[#13251a]/35 focus:border-[#0f3d25]/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/25"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => {
                  const active = activeCategory === category
                  const count =
                    category === 'all'
                      ? allHarvests.length
                      : allHarvests.filter((harvest) => harvest.category === category).length
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[9px] font-semibold transition-colors ${
                        active
                          ? 'bg-[#0f3d25] text-[#fbf7ec] dark:bg-[#d9f99d] dark:text-[#0f3d25]'
                          : 'border border-[#0f3d25]/10 bg-transparent text-[#13251a]/50 hover:border-[#0f3d25]/30 hover:text-[#0f3d25] dark:border-white/10 dark:text-white/40 dark:hover:border-white/25 dark:hover:text-white'
                      }`}
                    >
                      {t(`harvests.categories.${category}`)}
                      <span className={active ? 'opacity-50' : 'opacity-35'}>{count}</span>
                    </button>
                  )
                })}
              </div>

              <div className="relative shrink-0 xl:w-48">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  aria-label={t('harvests.sortBy')}
                  className="h-11 w-full appearance-none rounded-full border border-[#0f3d25]/10 bg-[#fbf7ec] pl-4 pr-9 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#13251a]/60 outline-none transition-colors focus:border-[#0f3d25]/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60"
                >
                  <option value="featured">{t('harvests.sortFeatured')}</option>
                  <option value="price-low">{t('harvests.sortPriceLow')}</option>
                  <option value="price-high">{t('harvests.sortPriceHigh')}</option>
                  <option value="rating">{t('harvests.sortRating')}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-3.5 -translate-y-1/2 text-[#13251a]/35 dark:text-white/30" />
              </div>
            </div>
          </div>

          {filteredHarvests.length > 0 ? (
            <motion.div layout className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredHarvests.map((harvest, index) => (
                  <HarvestCard
                    key={harvest.lot}
                    harvest={harvest}
                    featured={index === 0}
                    t={t}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex flex-col items-center rounded-[28px] border border-dashed border-[#0f3d25]/20 bg-[#fbf7ec]/60 px-6 py-16 text-center dark:border-white/15 dark:bg-white/[0.025]"
            >
              <span className="flex size-14 items-center justify-center rounded-full border border-[#0f3d25]/15 bg-[#d9f99d]/50 text-[#0f3d25] dark:border-white/10 dark:bg-white/5 dark:text-[#d9f99d]">
                <Search className="size-5" />
              </span>
              <h3 className="mt-5 font-serif text-2xl">{t('harvests.noResults')}</h3>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#13251a]/45 dark:text-white/35">
                {t('harvests.noResultsHint')}
              </p>
            </motion.div>
          )}

          <p className="mt-5 flex items-center gap-2 text-[8px] uppercase tracking-[0.12em] text-[#13251a]/30 dark:text-white/25">
            <span className="size-1.5 rounded-full bg-[#0f3d25] dark:bg-[#d9f99d]" />
            {t('harvests.boardFooter')}
          </p>
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
                {t('harvests.boardLabel')}
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-[1.02] tracking-[-0.045em] sm:text-4xl">
                {t('harvests.ctaTitle')}
              </h2>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-[#f7f3e9]/55 dark:text-white/40 sm:text-sm">
                {t('harvests.ctaSubtitle')}
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#d9f99d] px-6 py-3 text-xs font-semibold text-[#0f3d25] transition-colors hover:bg-white md:self-auto"
            >
              {t('harvests.ctaButton')}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </section>
    </PublicShell>
  )
}
