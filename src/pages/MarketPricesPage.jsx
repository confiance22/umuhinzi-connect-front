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
  ChevronDown,
  Citrus,
  Clock3,
  Info,
  Leaf,
  LineChart,
  MapPin,
  Salad,
  Search,
  Sprout,
  TrendingDown,
  TrendingUp,
  Wallet,
  Wheat
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PublicShell from '../components/public/PublicShell'
import { useLanguage } from '../context/LanguageContext'

const districts = ['all', 'Kigali', 'Musanze', 'Huye', 'Rubavu', 'Nyagatare', 'Rwamagana', 'Nyamasheke']

const priceRows = [
  {
    cropKey: 'harvests.crops.maize',
    market: 'Nyabugogo',
    district: 'Kigali',
    unit: 'kg',
    price: 460,
    change: 3.4,
    icon: Wheat,
    series: [430, 438, 442, 435, 448, 452, 460]
  },
  {
    cropKey: 'harvests.crops.beans',
    market: 'Musanze',
    district: 'Musanze',
    unit: 'kg',
    price: 790,
    change: 1.8,
    icon: Bean,
    series: [760, 768, 775, 770, 780, 786, 790]
  },
  {
    cropKey: 'harvests.crops.potatoes',
    market: 'Musanze',
    district: 'Musanze',
    unit: 'kg',
    price: 330,
    change: -2.1,
    icon: Sprout,
    series: [345, 340, 338, 335, 332, 334, 330]
  },
  {
    cropKey: 'harvests.crops.tomatoes',
    market: 'Nyabugogo',
    district: 'Kigali',
    unit: 'kg',
    price: 620,
    change: 5.2,
    icon: Cherry,
    series: [560, 575, 590, 585, 600, 610, 620]
  },
  {
    cropKey: 'harvests.crops.rice',
    market: 'Bugarama',
    district: 'Huye',
    unit: 'kg',
    price: 960,
    change: 0.9,
    icon: Wheat,
    series: [940, 945, 950, 955, 952, 958, 960]
  },
  {
    cropKey: 'harvests.crops.cassava',
    market: 'Huye',
    district: 'Huye',
    unit: 'kg',
    price: 290,
    change: -1.4,
    icon: Leaf,
    series: [300, 298, 295, 294, 292, 291, 290]
  },
  {
    cropKey: 'harvests.crops.onions',
    market: 'Rubavu',
    district: 'Rubavu',
    unit: 'kg',
    price: 540,
    change: 4.1,
    icon: Salad,
    series: [500, 510, 515, 520, 525, 530, 540]
  },
  {
    cropKey: 'harvests.crops.avocado',
    market: 'Nyagatare',
    district: 'Nyagatare',
    unit: 'kg',
    price: 870,
    change: -0.8,
    icon: Apple,
    series: [880, 875, 872, 878, 874, 872, 870]
  },
  {
    cropKey: 'harvests.crops.bananas',
    market: 'Rwamagana',
    district: 'Rwamagana',
    unit: 'kg',
    price: 360,
    change: 2.6,
    icon: Banana,
    series: [340, 345, 350, 348, 352, 355, 360]
  },
  {
    cropKey: 'harvests.crops.oranges',
    market: 'Nyamasheke',
    district: 'Nyamasheke',
    unit: 'kg',
    price: 710,
    change: -3.2,
    icon: Citrus,
    series: [740, 735, 730, 725, 720, 715, 710]
  },
  {
    cropKey: 'harvests.crops.cabbage',
    market: 'Rubavu',
    district: 'Rubavu',
    unit: 'kg',
    price: 260,
    change: 1.1,
    icon: Salad,
    series: [250, 252, 255, 254, 258, 259, 260]
  },
  {
    cropKey: 'harvests.crops.carrots',
    market: 'Nyabugogo',
    district: 'Kigali',
    unit: 'kg',
    price: 410,
    change: 0.4,
    icon: Carrot,
    series: [400, 402, 405, 404, 408, 409, 410]
  }
]

const averageSeries = Array.from({ length: 7 }, (_, index) =>
  Math.round(priceRows.reduce((total, row) => total + row.series[index], 0) / priceRows.length)
)

const ease = [0.16, 1, 0.3, 1]

function Sparkline({ values, tone = 'up', className = '' }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100
      const y = 26 - ((value - min) / range) * 20
      return `${x},${y}`
    })
    .join(' ')

  const last = values[values.length - 1]

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true" className={className}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={tone === 'down' ? 'text-[#a4472b] dark:text-[#f0a6a0]' : 'text-[#0f3d25] dark:text-[#d9f99d]'}
      />
      <circle
        cx="100"
        cy={26 - ((last - min) / range) * 20}
        r="2.2"
        fill="currentColor"
        className={tone === 'down' ? 'text-[#a4472b] dark:text-[#f0a6a0]' : 'text-[#0f3d25] dark:text-[#d9f99d]'}
      />
    </svg>
  )
}

function ChangeBadge({ change, compact = false }) {
  const isUp = change > 0
  const Icon = isUp ? TrendingUp : TrendingDown

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${
        compact ? 'px-2 py-1 text-[8px]' : 'px-2.5 py-1.5 text-[9px]'
      } ${
        isUp
          ? 'bg-[#d9f99d]/70 text-[#0f3d25] dark:bg-[#d9f99d]/15 dark:text-[#d9f99d]'
          : 'bg-[#a4472b]/10 text-[#8f3c3c] dark:bg-[#f0a6a0]/10 dark:text-[#f0a6a0]'
      }`}
    >
      <Icon className="size-3" />
      {isUp ? '+' : ''}
      {change.toFixed(1)}%
    </span>
  )
}

function SummaryCard({ icon: Icon, label, value, hint, tone = 'neutral', children }) {
  const surfaces = {
    neutral: 'bg-[#fbf7ec] text-[#13251a] dark:bg-[#0b1710] dark:text-[#f2eee3]',
    up: 'bg-[#e7efda] text-[#0f3d25] dark:bg-[#10261a] dark:text-[#d9f99d]',
    down: 'bg-[#eeded7] text-[#6d2f32] dark:bg-[#291715] dark:text-[#f0a6a0]'
  }
  const chips = {
    neutral: 'bg-[#0f3d25] text-[#d9f99d] dark:bg-[#d9f99d] dark:text-[#0f3d25]',
    up: 'bg-[#0f3d25] text-[#f7f3e9] dark:bg-[#d9f99d] dark:text-[#0f3d25]',
    down: 'bg-[#6d2f32] text-[#f7f3e9] dark:bg-[#f0a6a0] dark:text-[#291715]'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className={`relative overflow-hidden rounded-[24px] border border-[#0f3d25]/[0.12] p-5 shadow-[8px_10px_0_rgba(15,61,37,0.04)] dark:border-white/10 dark:shadow-[8px_10px_0_rgba(0,0,0,0.16)] ${surfaces[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[8px] font-semibold uppercase tracking-[0.15em] opacity-50">{label}</p>
        <span className={`flex size-8 items-center justify-center rounded-full ${chips[tone]}`}>
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className="mt-4 font-serif text-[30px] leading-none tracking-[-0.04em]">{value}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-[9px] font-medium opacity-55">{hint}</p>
        {children}
      </div>
      <span
        aria-hidden="true"
        className="absolute -bottom-12 -right-10 size-28 rounded-full border border-current opacity-10"
      />
    </motion.div>
  )
}

export default function MarketPricesPage() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('all')

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return priceRows.filter((row) => {
      const matchesDistrict = district === 'all' || row.district === district
      const haystack = `${t(row.cropKey)} ${row.market} ${row.district}`.toLowerCase()
      return matchesDistrict && (!needle || haystack.includes(needle))
    })
  }, [district, query, t])

  const averagePrice = Math.round(
    priceRows.reduce((total, row) => total + row.price, 0) / priceRows.length
  )
  const averageChange =
    priceRows.reduce((total, row) => total + row.change, 0) / priceRows.length
  const topGainer = priceRows.reduce((best, row) => (row.change > best.change ? row : best))
  const topLoser = priceRows.reduce((worst, row) => (row.change < worst.change ? row : worst))
  const updatedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

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
                <span className="size-1.5 animate-pulse rounded-full bg-[#0f3d25] dark:bg-[#d9f99d]" />
                {t('prices.deskLabel')}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#13251a]/35 dark:text-white/30">
                <Clock3 className="size-3" />
                {t('prices.updated')} · {updatedDate}
              </span>
            </div>

            <h1 className="mt-6 max-w-[760px] font-serif text-[clamp(3.1rem,7vw,6.1rem)] leading-[0.88] tracking-[-0.06em]">
              {t('prices.title')}
            </h1>
            <p className="mt-6 max-w-[540px] text-sm leading-[1.8] text-[#13251a]/55 dark:text-white/45 sm:text-[15px]">
              {t('prices.subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/harvests"
                className="inline-flex items-center gap-2 rounded-full bg-[#0f3d25] px-6 py-3 text-xs font-semibold text-[#f7f3e9] transition-colors hover:bg-[#14532d] dark:bg-[#d9f99d] dark:text-[#0f3d25] dark:hover:bg-white"
              >
                {t('prices.ctaButton')}
                <ArrowRight className="size-3.5" />
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#0f3d25]/20 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#13251a]/45 dark:border-white/20 dark:text-white/35">
                <LineChart className="size-3.5" />
                {t('prices.badge')}
              </span>
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
              <span>{t('prices.boardLabel')}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d9f99d] px-2 py-1 text-[#0f3d25]">
                <span className="size-1.5 animate-pulse rounded-full bg-[#0f3d25]" />
                {t('prices.live')}
              </span>
            </div>

            <div className="relative mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#f7f3e9]/35 dark:text-white/25">
                  {t('prices.basketAverage')}
                </p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-serif text-[54px] leading-[0.78] tracking-[-0.06em]">
                    {averagePrice.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-[#f7f3e9]/35 dark:text-white/25">RWF</span>
                </p>
              </div>
              <ChangeBadge change={averageChange} />
            </div>

            <Sparkline values={averageSeries} className="mt-5 h-16 w-full" />

            <div className="relative mt-4 grid grid-cols-2 gap-2 border-t border-[#f7f3e9]/10 pt-4 dark:border-white/10">
              <div>
                <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-[#f7f3e9]/30 dark:text-white/25">
                  {t('prices.topMover')}
                </p>
                <p className="mt-1.5 font-serif text-[15px]">{t(topGainer.cropKey)}</p>
                <p className="mt-0.5 text-[8px] font-semibold text-[#d9f99d] dark:text-brand-200">
                  +{topGainer.change.toFixed(1)}%
                </p>
              </div>
              <div className="border-l border-[#f7f3e9]/10 pl-4 dark:border-white/10">
                <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-[#f7f3e9]/30 dark:text-white/25">
                  {t('prices.losers')}
                </p>
                <p className="mt-1.5 font-serif text-[15px]">{t(topLoser.cropKey)}</p>
                <p className="mt-0.5 text-[8px] font-semibold text-[#f0a6a0]">
                  {topLoser.change.toFixed(1)}%
                </p>
              </div>
            </div>

            <p className="relative mt-4 text-[8px] leading-relaxed text-[#f7f3e9]/30 dark:text-white/25">
              {t('prices.boardNote')}
            </p>
          </motion.aside>
        </div>

        <div className="mt-6 overflow-x-auto border-y border-[#0f3d25]/10 dark:border-white/10">
          <div className="flex min-w-max divide-x divide-[#0f3d25]/10 dark:divide-white/10">
            {priceRows.map((row) => {
              const Icon = row.icon
              return (
                <div
                  key={`tape-${row.cropKey}`}
                  className="flex items-center gap-2.5 px-4 py-3 text-[9px]"
                >
                  <Icon className="size-3.5 text-[#0f3d25]/45 dark:text-white/30" />
                  <span className="font-medium text-[#13251a]/65 dark:text-white/45">
                    {t(row.cropKey)}
                  </span>
                  <span className="font-serif text-[13px]">{row.price.toLocaleString()}</span>
                  <ChangeBadge change={row.change} compact />
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={Wallet}
            label={t('prices.average')}
            value={`${averagePrice.toLocaleString()} RWF`}
            hint={t('common.perKg')}
          >
            <Sparkline values={averageSeries} className="h-7 w-20" />
          </SummaryCard>
          <SummaryCard
            icon={TrendingUp}
            label={t('prices.gainers')}
            value={t(topGainer.cropKey)}
            hint={`+${topGainer.change.toFixed(1)}%`}
            tone="up"
          >
            <Sparkline values={topGainer.series} className="h-7 w-20" />
          </SummaryCard>
          <SummaryCard
            icon={TrendingDown}
            label={t('prices.losers')}
            value={t(topLoser.cropKey)}
            hint={`${topLoser.change.toFixed(1)}%`}
            tone="down"
          >
            <Sparkline values={topLoser.series} tone="down" className="h-7 w-20" />
          </SummaryCard>
        </div>

        <section className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/45 dark:text-brand-200/40">
                {t('prices.badge')}
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.045em] sm:text-4xl">
                {t('prices.boardLabel')}
              </h2>
            </div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#13251a]/35 dark:text-white/30">
              {filteredRows.length} {t('prices.crop').toLowerCase()} · {t('prices.updated')}
            </p>
          </div>

          <div className="sticky top-[74px] z-30 mt-5 rounded-[22px] border border-[#0f3d25]/10 bg-[#f6f1e6]/90 p-2.5 shadow-[0_18px_45px_-34px_rgba(15,61,37,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-[#07100a]/90 dark:shadow-none">
            <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#13251a]/35 dark:text-white/30" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('prices.searchPlaceholder')}
                  className="h-11 w-full rounded-full border border-[#0f3d25]/10 bg-[#fbf7ec] pl-11 pr-4 text-xs text-[#13251a] outline-none transition-colors placeholder:text-[#13251a]/35 focus:border-[#0f3d25]/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/25"
                />
              </div>
              <div className="relative md:w-60">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-[#13251a]/35 dark:text-white/30" />
                <select
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  className="h-11 w-full appearance-none rounded-full border border-[#0f3d25]/10 bg-[#fbf7ec] pl-10 pr-9 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#13251a]/60 outline-none transition-colors focus:border-[#0f3d25]/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60"
                >
                  {districts.map((market) => (
                    <option key={market} value={market}>
                      {market === 'all' ? t('prices.allDistricts') : market}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-3.5 -translate-y-1/2 text-[#13251a]/35 dark:text-white/30" />
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[26px] border border-[#0f3d25]/15 bg-[#fbf7ec] shadow-[10px_12px_0_rgba(15,61,37,0.045)] dark:border-white/[0.12] dark:bg-[#0b1710] dark:shadow-[10px_12px_0_rgba(0,0,0,0.18)]">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-[#0f3d25]/10 bg-[#0f3d25]/[0.025] text-[7px] font-semibold uppercase tracking-[0.16em] text-[#13251a]/35 dark:border-white/10 dark:bg-white/[0.025] dark:text-white/30">
                    <th className="px-5 py-4 font-semibold">{t('prices.crop')}</th>
                    <th className="px-4 py-4 font-semibold">{t('prices.market')}</th>
                    <th className="px-4 py-4 font-semibold">{t('prices.trend')}</th>
                    <th className="px-4 py-4 font-semibold">{t('prices.unit')}</th>
                    <th className="px-4 py-4 font-semibold">{t('prices.priceToday')}</th>
                    <th className="px-4 py-4 text-right font-semibold">{t('prices.change')}</th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0f3d25]/10 dark:divide-white/10">
                  {filteredRows.map((row) => {
                    const Icon = row.icon
                    return (
                      <tr
                        key={`${row.cropKey}-${row.market}`}
                        className="group transition-colors hover:bg-[#0f3d25]/[0.03] dark:hover:bg-white/[0.025]"
                      >
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-full border border-[#0f3d25]/10 bg-[#e7efda]/70 text-[#0f3d25] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#d9f99d]">
                              <Icon className="size-4" />
                            </span>
                            <span>
                              <span className="block text-[12px] font-semibold leading-tight">
                                {t(row.cropKey)}
                              </span>
                              <span className="text-[8px] uppercase tracking-[0.12em] text-[#13251a]/35 dark:text-white/25">
                                {row.district}
                              </span>
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[10px] text-[#13251a]/55 dark:text-white/40">
                          {row.market}
                        </td>
                        <td className="px-4 py-4">
                          <Sparkline
                            values={row.series}
                            tone={row.change < 0 ? 'down' : 'up'}
                            className="h-6 w-20"
                          />
                        </td>
                        <td className="px-4 py-4 text-[9px] text-[#13251a]/40 dark:text-white/30">
                          {row.unit}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-serif text-[20px] leading-none tracking-[-0.03em]">
                            {row.price.toLocaleString()}
                          </span>
                          <span className="ml-1 text-[8px] text-[#13251a]/35 dark:text-white/25">RWF</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <ChangeBadge change={row.change} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            to="/harvests"
                            aria-label={t('prices.ctaButton')}
                            className="inline-flex size-8 items-center justify-center rounded-full border border-[#0f3d25]/10 text-[#13251a]/40 transition-all group-hover:border-[#0f3d25] group-hover:bg-[#0f3d25] group-hover:text-[#fbf7ec] dark:border-white/10 dark:text-white/30 dark:group-hover:border-[#d9f99d] dark:group-hover:bg-[#d9f99d] dark:group-hover:text-[#0f3d25]"
                          >
                            <ArrowUpRight className="size-3.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-[#0f3d25]/10 dark:divide-white/10 md:hidden">
              {filteredRows.map((row) => {
                const Icon = row.icon
                return (
                  <div key={`${row.cropKey}-${row.market}-mobile`} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full border border-[#0f3d25]/10 bg-[#e7efda]/70 text-[#0f3d25] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#d9f99d]">
                          <Icon className="size-4" />
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold">{t(row.cropKey)}</p>
                          <p className="mt-0.5 text-[8px] uppercase tracking-[0.1em] text-[#13251a]/35 dark:text-white/25">
                            {row.market} · {row.district}
                          </p>
                        </div>
                      </div>
                      <ChangeBadge change={row.change} />
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <Sparkline
                        values={row.series}
                        tone={row.change < 0 ? 'down' : 'up'}
                        className="h-6 w-24"
                      />
                      <p className="font-serif text-[20px] leading-none tracking-[-0.03em]">
                        {row.price.toLocaleString()}
                        <span className="ml-1 text-[8px] font-sans tracking-normal text-[#13251a]/35 dark:text-white/25">
                          RWF / {row.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredRows.length === 0 && (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <span className="flex size-14 items-center justify-center rounded-full border border-[#0f3d25]/15 bg-[#d9f99d]/50 text-[#0f3d25] dark:border-white/10 dark:bg-white/5 dark:text-[#d9f99d]">
                  <Search className="size-5" />
                </span>
                <p className="mt-5 font-serif text-2xl">{t('prices.noResults')}</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-[18px] border border-[#0f3d25]/[0.12] bg-[#d9f99d]/25 p-4 text-[10px] leading-relaxed text-[#13251a]/55 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/35">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0f3d25] text-[#d9f99d] dark:bg-[#d9f99d] dark:text-[#0f3d25]">
              <Info className="size-3.5" />
            </span>
            <p className="pt-1">{t('prices.note')}</p>
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
                {t('prices.boardLabel')}
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-[1.02] tracking-[-0.045em] sm:text-4xl">
                {t('prices.ctaTitle')}
              </h2>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-[#f7f3e9]/55 dark:text-white/40 sm:text-sm">
                {t('prices.ctaSubtitle')}
              </p>
            </div>
            <Link
              to="/harvests"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#d9f99d] px-6 py-3 text-xs font-semibold text-[#0f3d25] transition-colors hover:bg-white md:self-auto"
            >
              {t('prices.ctaButton')}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </section>
    </PublicShell>
  )
}
