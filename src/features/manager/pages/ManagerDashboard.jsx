/**
 * ManagerDashboard — farmer overview. Only uses the live harvest APIs:
 * listing totals, recent harvests and open buyer demand.
 */
import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { harvestApi } from '../../../api/harvestApi'
import { useAuth } from '../../../hooks/useAuth'
import { useLanguage } from '../../../context/LanguageContext'
import { ROUTE_PATHS } from '../../../constants/routePaths'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'

const STATUS_STYLES = {
  active: 'bg-brand-50 text-brand-700',
  sold: 'bg-sky-50 text-sky-600',
  hidden: 'bg-gray-100 text-gray-500',
  expired: 'bg-amber-50 text-amber-600'
}

const StatusBadge = ({ status, label }) => (
  <span
    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
      STATUS_STYLES[status] || STATUS_STYLES.hidden
    }`}
  >
    {status || 'active'}
  </span>
)

const KPI_ICONS = {
  leaf: 'M5 21c8 0 14-6 14-14V3h-4C7 3 3 9 3 15v6h2zm0 0c1-4 3-7 6-9',
  scale: 'M12 3v18m-7-9h14M7 8l-3 6h6L7 8zm10 0l-3 6h6l-3-6z',
  coins: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  receipt: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
}

const Icon = ({ path, className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
)

export const ManagerDashboard = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await harvestApi.overview())
    } catch (err) {
      setError(err?.message || t('portal.farmer.overview.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const firstName = String(
    user?.name || user?.full_name || t('portal.farmer.account.farmer')
  ).split(' ')[0]
  const summary = data?.summary || {}
  const recent = data?.recentHarvests || []
  const openRequests = data?.openRequests || 0

  const kpis = [
    {
      label: t('portal.farmer.overview.activeHarvests'),
      value: summary.activeHarvests || 0,
      sub: `${Number(summary.activeKg || 0).toLocaleString()} ${t('portal.farmer.overview.kgListed')}`,
      icon: KPI_ICONS.leaf,
      accent: true
    },
    {
      label: t('portal.farmer.overview.totalHarvests'),
      value: summary.totalHarvests || 0,
      sub: `${Number(summary.totalKg || 0).toLocaleString()} ${t('portal.farmer.overview.kgRecorded')}`,
      icon: KPI_ICONS.scale
    },
    {
      label: t('portal.farmer.overview.listedValue'),
      value: formatCurrency(summary.listedValue),
      sub: t('portal.farmer.overview.fromActive'),
      icon: KPI_ICONS.coins
    },
    {
      label: t('portal.farmer.overview.soldValue'),
      value: formatCurrency(summary.soldValue),
      sub: `${summary.soldHarvests || 0} ${t('portal.farmer.overview.harvested')}`,
      icon: KPI_ICONS.receipt
    }
  ]

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-72 rounded-xl bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-200/70" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-80 rounded-2xl bg-gray-200/70 lg:col-span-2" />
          <div className="h-80 rounded-2xl bg-gray-200/70" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center shadow-soft">
        <p className="text-sm font-semibold text-ink">{t('portal.farmer.overview.loadError')}</p>
        <p className="mt-1 text-sm text-muted">{t('portal.farmer.common.offline')}</p>
        <button
          type="button"
          onClick={load}
          className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {t('portal.farmer.common.tryAgain')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-brand-700">
            {t('portal.farmer.overview.badge')}
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {t('portal.farmer.overview.welcome')}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted">{t('portal.farmer.overview.intro')}</p>
        </div>
        <div className="flex items-center gap-2.5 rounded-full bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-page" />
          <span className="uppercase tracking-wide">
            {openRequests > 0
              ? `${openRequests} ${t('portal.farmer.overview.openRequests')}`
              : t('portal.farmer.overview.ready')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => (
          <div
            key={card.label}
            className={`relative rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
              card.accent ? 'border-ink bg-ink' : 'border-line bg-card shadow-soft'
            }`}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                card.accent ? 'bg-brand-600 text-white' : 'bg-page text-ink'
              }`}
            >
              <Icon path={card.icon} />
            </span>
            <p
              className={`mt-4 font-bold tracking-tight tabular-nums ${
                String(card.value).startsWith('RWF') ? 'text-2xl' : 'text-3xl'
              } ${card.accent ? 'text-white' : 'text-ink'}`}
            >
              {card.value}
            </p>
            <p className={`mt-0.5 text-sm font-medium ${card.accent ? 'text-white/80' : 'text-muted'}`}>
              {card.label}
            </p>
            <p className={`mt-2 text-xs ${card.accent ? 'text-white/50' : 'text-gray-400'}`}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-sm font-semibold text-ink">
              {t('portal.farmer.overview.recentHarvests')}
            </h2>
            <Link
              to={ROUTE_PATHS.PRODUCTS}
              className="text-xs font-medium text-gray-400 transition-colors hover:text-ink"
            >
              {t('portal.farmer.overview.viewAll')}
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-semibold text-ink">
                {t('portal.farmer.overview.noHarvests')}
              </p>
              <p className="mt-1 text-sm text-muted">
                {t('portal.farmer.overview.noHarvestsText')}
              </p>
              <Link
                to={ROUTE_PATHS.PRODUCT_ADD}
                className="mt-5 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                {t('portal.farmer.overview.listHarvest')}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {recent.map((harvest) => (
                <div key={harvest.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">
                    {harvest.cropName?.charAt(0)?.toUpperCase() || 'H'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink">{harvest.cropName}</p>
                      <StatusBadge
                        status={harvest.status}
                        label={t(`portal.farmer.common.${harvest.status || 'active'}`)}
                      />
                    </div>
                    <p className="truncate text-xs text-muted">
                      {Number(harvest.quantityKg).toLocaleString()}{' '}
                      {t('portal.farmer.common.kg')} · {formatCurrency(harvest.pricePerKg)}/
                      {t('portal.farmer.common.kg')} · {harvest.district}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-semibold tabular-nums text-ink">
                      {formatCurrency(harvest.totalValue)}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(harvest.harvestDate)}</p>
                  </div>
                  <Link
                    to={ROUTE_PATHS.PRODUCT_EDIT(harvest.id)}
                    className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:border-brand-500/40 hover:text-brand-700"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
            <h2 className="mb-4 text-sm font-semibold text-ink">
              {t('portal.farmer.overview.quickActions')}
            </h2>
            <div className="space-y-1.5">
              {[
                {
                  label: t('portal.farmer.overview.listHarvest'),
                  desc: t('portal.farmer.overview.actionListDesc'),
                  to: ROUTE_PATHS.PRODUCT_ADD,
                  icon: 'M12 5v14M5 12h14'
                },
                {
                  label: t('portal.farmer.overview.actionHarvests'),
                  desc: t('portal.farmer.overview.actionHarvestsDesc'),
                  to: ROUTE_PATHS.PRODUCTS,
                  icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z'
                },
                {
                  label: t('portal.farmer.overview.actionReport'),
                  desc: t('portal.farmer.overview.actionReportDesc'),
                  to: ROUTE_PATHS.REPORTS,
                  icon: 'M4 20V10m6 10V4m6 16v-7'
                },
                {
                  label: t('portal.farmer.overview.actionAccount'),
                  desc: t('portal.farmer.overview.actionAccountDesc'),
                  to: ROUTE_PATHS.ACCOUNT,
                  icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.1a7.5 7.5 0 0115 0'
                }
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex items-center gap-3.5 rounded-xl p-2.5 transition-colors hover:bg-page"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-page text-ink transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <Icon path={action.icon} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{action.label}</p>
                    <p className="truncate text-xs text-gray-400">{action.desc}</p>
                  </div>
                  <svg
                    className="ml-auto h-4 w-4 text-gray-300 transition-colors group-hover:text-ink"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-brand-600 p-6 shadow-[0_8px_32px_rgba(15,118,110,0.25)]">
            <div className="pointer-events-none absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-page/20" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                {t('portal.farmer.overview.openDemand')}
              </p>
              <p className="mt-2 text-xl font-bold leading-snug text-white">
                {openRequests > 0
                  ? `${openRequests} ${t('portal.farmer.overview.demandWaiting')}`
                  : t('portal.farmer.overview.noDemand')}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/65">
                {openRequests > 0
                  ? t('portal.farmer.overview.demandActiveText')
                  : t('portal.farmer.overview.demandEmptyText')}
              </p>
              <Link
                to={ROUTE_PATHS.PRODUCTS}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-all hover:gap-2.5 hover:bg-ink-soft"
              >
                {t('portal.farmer.overview.manageHarvests')}
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
