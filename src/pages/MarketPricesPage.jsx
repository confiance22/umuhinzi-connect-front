import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Clock3,
  Info,
  LineChart,
  MapPin,
  Search,
  Sprout,
  TrendingDown,
  TrendingUp,
  Wallet
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
    change: 3.4
  },
  {
    cropKey: 'harvests.crops.beans',
    market: 'Musanze',
    district: 'Musanze',
    unit: 'kg',
    price: 790,
    change: 1.8
  },
  {
    cropKey: 'harvests.crops.potatoes',
    market: 'Musanze',
    district: 'Musanze',
    unit: 'kg',
    price: 330,
    change: -2.1
  },
  {
    cropKey: 'harvests.crops.tomatoes',
    market: 'Nyabugogo',
    district: 'Kigali',
    unit: 'kg',
    price: 620,
    change: 5.2
  },
  {
    cropKey: 'harvests.crops.rice',
    market: 'Bugarama',
    district: 'Huye',
    unit: 'kg',
    price: 960,
    change: 0.9
  },
  {
    cropKey: 'harvests.crops.cassava',
    market: 'Huye',
    district: 'Huye',
    unit: 'kg',
    price: 290,
    change: -1.4
  },
  {
    cropKey: 'harvests.crops.onions',
    market: 'Rubavu',
    district: 'Rubavu',
    unit: 'kg',
    price: 540,
    change: 4.1
  },
  {
    cropKey: 'harvests.crops.avocado',
    market: 'Nyagatare',
    district: 'Nyagatare',
    unit: 'kg',
    price: 870,
    change: -0.8
  },
  {
    cropKey: 'harvests.crops.bananas',
    market: 'Rwamagana',
    district: 'Rwamagana',
    unit: 'kg',
    price: 360,
    change: 2.6
  },
  {
    cropKey: 'harvests.crops.oranges',
    market: 'Nyamasheke',
    district: 'Nyamasheke',
    unit: 'kg',
    price: 710,
    change: -3.2
  },
  {
    cropKey: 'harvests.crops.cabbage',
    market: 'Rubavu',
    district: 'Rubavu',
    unit: 'kg',
    price: 260,
    change: 1.1
  },
  {
    cropKey: 'harvests.crops.carrots',
    market: 'Nyabugogo',
    district: 'Kigali',
    unit: 'kg',
    price: 410,
    change: 0.4
  }
]

function SummaryCard({ icon: Icon, label, value, hint, tone = 'brand' }) {
  const toneClass =
    tone === 'green'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'red'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-brand-600 dark:text-brand-300'

  return (
    <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_18px_45px_-34px_rgba(5,46,22,0.3)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted dark:text-gray-400">{label}</p>
        <span className={`flex size-9 items-center justify-center rounded-xl bg-brand-500/10 ${toneClass}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-xl font-bold text-ink dark:text-white">{value}</p>
      <p className={`mt-1 text-xs font-medium ${toneClass}`}>{hint}</p>
    </div>
  )
}

function ChangeBadge({ change }) {
  const isUp = change > 0
  const isDown = change < 0
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : LineChart

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isUp
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : isDown
            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
            : 'bg-black/5 text-muted dark:bg-white/10 dark:text-gray-400'
      }`}
    >
      <Icon className="size-3.5" />
      {isUp ? '+' : ''}
      {change.toFixed(1)}%
    </span>
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
  const topGainer = priceRows.reduce((best, row) => (row.change > best.change ? row : best))
  const topLoser = priceRows.reduce((worst, row) => (row.change < worst.change ? row : worst))
  const updatedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

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
            <LineChart className="size-3.5" />
            {t('prices.badge')}
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink dark:text-white sm:text-4xl md:text-5xl">
            {t('prices.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted dark:text-gray-400 sm:text-base">
            {t('prices.subtitle')}
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted dark:text-gray-400">
            <Clock3 className="size-3.5 text-brand-500" />
            {t('prices.updated')} · {updatedDate}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={Wallet}
            label={t('prices.average')}
            value={`${averagePrice.toLocaleString()} RWF`}
            hint={t('common.perKg')}
          />
          <SummaryCard
            icon={TrendingUp}
            label={t('prices.gainers')}
            value={t(topGainer.cropKey)}
            hint={`+${topGainer.change.toFixed(1)}%`}
            tone="green"
          />
          <SummaryCard
            icon={TrendingDown}
            label={t('prices.losers')}
            value={t(topLoser.cropKey)}
            hint={`${topLoser.change.toFixed(1)}%`}
            tone="red"
          />
        </div>

        <div className="mt-8 rounded-3xl border border-black/5 bg-white/80 p-3 shadow-[0_20px_55px_-38px_rgba(5,46,22,0.35)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted dark:text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('prices.searchPlaceholder')}
                className="h-12 w-full rounded-full border border-black/5 bg-white pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div className="relative md:w-56">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted dark:text-gray-400" />
              <select
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                className="h-12 w-full appearance-none rounded-full border border-black/5 bg-white pl-11 pr-9 text-sm text-ink outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {districts.map((market) => (
                  <option key={market} value={market}>
                    {market === 'all' ? t('prices.allDistricts') : market}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_24px_60px_-40px_rgba(5,46,22,0.32)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-black/[0.02] text-[11px] uppercase tracking-[0.14em] text-muted dark:bg-white/[0.03] dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t('prices.crop')}</th>
                  <th className="px-6 py-4 font-semibold">{t('prices.market')}</th>
                  <th className="px-6 py-4 font-semibold">{t('prices.unit')}</th>
                  <th className="px-6 py-4 font-semibold">{t('prices.priceToday')}</th>
                  <th className="px-6 py-4 text-right font-semibold">{t('prices.change')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {filteredRows.map((row) => (
                  <tr
                    key={`${row.cropKey}-${row.market}`}
                    className="transition-colors hover:bg-brand-50/60 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 font-medium text-ink dark:text-white">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300">
                          <Sprout className="size-4" />
                        </span>
                        {t(row.cropKey)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted dark:text-gray-400">
                      <span className="block">{row.market}</span>
                      <span className="text-xs">{row.district}</span>
                    </td>
                    <td className="px-6 py-4 text-muted dark:text-gray-400">{row.unit}</td>
                    <td className="px-6 py-4 font-semibold text-ink dark:text-white">
                      {row.price.toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChangeBadge change={row.change} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/10 md:hidden">
            {filteredRows.map((row) => (
              <div key={`${row.cropKey}-${row.market}-mobile`} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink dark:text-white">{t(row.cropKey)}</p>
                    <p className="mt-0.5 text-xs text-muted dark:text-gray-400">
                      {row.market} · {row.district}
                    </p>
                  </div>
                  <ChangeBadge change={row.change} />
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-xs text-muted dark:text-gray-400">
                    {row.unit} · {t('prices.priceToday')}
                  </p>
                  <p className="text-lg font-bold text-ink dark:text-white">
                    {row.price.toLocaleString()} <span className="text-xs font-medium">RWF</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredRows.length === 0 && (
            <div className="p-12 text-center">
              <Search className="mx-auto size-8 text-brand-500" />
              <p className="mt-4 text-sm font-medium text-ink dark:text-white">
                {t('prices.noResults')}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 text-sm text-muted dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-gray-400">
          <Info className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-300" />
          <p>{t('prices.note')}</p>
        </div>

        <section className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-[0_30px_80px_-40px_rgba(22,163,74,0.65)] sm:p-12">
          <div className="absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">{t('prices.ctaTitle')}</h2>
              <p className="mt-3 max-w-xl text-sm text-brand-50/90">{t('prices.ctaSubtitle')}</p>
            </div>
            <Link
              to="/harvests"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('prices.ctaButton')}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </section>
    </PublicShell>
  )
}
