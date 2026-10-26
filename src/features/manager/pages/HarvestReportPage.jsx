/**
 * HarvestReportPage — live harvest performance summary with crop and monthly
 * breakdown. Backed by GET /api/harvests/report.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import CustomSelect from '../../../components/common/CustomSelect'
import { harvestApi } from '../../../api/harvestApi'
import { useLanguage } from '../../../context/LanguageContext'
import { formatCurrency } from '../../../utils/formatCurrency'

const getStatusOptions = (t) => [
  { value: '', label: t('portal.farmer.common.allStatuses') },
  { value: 'active', label: t('portal.farmer.common.active') },
  { value: 'sold', label: t('portal.farmer.common.sold') },
  { value: 'hidden', label: t('portal.farmer.common.hidden') },
  { value: 'expired', label: t('portal.farmer.common.expired') }
]

const monthLabel = (value) => {
  if (!value) return ''
  const [year, month] = value.split('-')
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-RW', {
    month: 'short',
    year: 'numeric'
  })
}

const inputClass =
  'h-11 w-full rounded-xl border border-line bg-page px-3.5 text-sm text-ink focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/20'

const KPI_ICONS = {
  harvests: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  weight: 'M12 3v18m-7-9h14M7 8l-3 6h6L7 8zm10 0l-3 6h6l-3-6z',
  price: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  value: 'M3 3v18h18M7 15l4-4 3 3 5-6'
}

const Icon = ({ path }) => (
  <svg
    className="h-5 w-5"
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

export const HarvestReportPage = () => {
  const { t } = useLanguage()
  const statusOptions = useMemo(() => getStatusOptions(t), [t])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (status) params.status = status
      setData(await harvestApi.report(params))
    } catch (err) {
      setError(err?.message || t('portal.farmer.report.loadError'))
    } finally {
      setLoading(false)
    }
  }, [endDate, startDate, status])

  useEffect(() => {
    load()
  }, [load])

  const resetFilters = () => {
    setStartDate('')
    setEndDate('')
    setStatus('')
  }

  const summary = data?.summary || {}
  const byCrop = data?.byCrop || []
  const monthly = data?.monthly || []
  const maxMonthlyValue = useMemo(
    () => Math.max(1, ...monthly.map((month) => Number(month.value) || 0)),
    [monthly]
  )

  const kpis = [
    {
      label: t('portal.farmer.report.kpiHarvests'),
      value: summary.harvests || 0,
      sub: `${summary.activeCount || 0} ${t('portal.farmer.common.active').toLowerCase()} · ${summary.soldCount || 0} ${t('portal.farmer.common.sold').toLowerCase()}`,
      icon: KPI_ICONS.harvests
    },
    {
      label: t('portal.farmer.report.kpiQuantity'),
      value: `${Number(summary.quantityKg || 0).toLocaleString()} ${t('portal.farmer.common.kg')}`,
      sub: t('portal.farmer.report.acrossMatching'),
      icon: KPI_ICONS.weight
    },
    {
      label: t('portal.farmer.report.kpiAverage'),
      value: formatCurrency(summary.averagePrice),
      sub: t('portal.farmer.report.perKg'),
      icon: KPI_ICONS.price
    },
    {
      label: t('portal.farmer.report.kpiValue'),
      value: formatCurrency(summary.value),
      sub: t('portal.farmer.report.totalValue'),
      icon: KPI_ICONS.value,
      accent: true
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-brand-700">
            {t('portal.farmer.report.badge')}
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {t('portal.farmer.report.title')}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t('portal.farmer.report.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-page px-4 py-2.5 text-sm font-semibold text-muted hover:border-brand-500/40 hover:text-brand-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('portal.farmer.common.refresh')}
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-card p-4 shadow-soft">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted" htmlFor="report-start">
              {t('portal.farmer.common.fromDate')}
            </label>
            <input
              id="report-start"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted" htmlFor="report-end">
              {t('portal.farmer.common.toDate')}
            </label>
            <input
              id="report-end"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted" htmlFor="report-status">
              {t('portal.farmer.common.status')}
            </label>
            <CustomSelect
              id="report-status"
              value={status}
              options={statusOptions}
              onChange={setStatus}
              placeholder={t('portal.farmer.common.allStatuses')}
              tone="public"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="h-11 w-full rounded-xl border border-line bg-page px-4 text-sm font-semibold text-muted hover:text-ink"
            >
              {t('portal.farmer.common.clearFilters')}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-line bg-card p-8 text-center shadow-soft">
          <p className="text-sm font-semibold text-ink">
            {t('portal.farmer.report.loadError')}
          </p>
          <p className="mt-1 text-sm text-muted">{t('portal.farmer.common.offline')}</p>
          <button
            type="button"
            onClick={load}
            className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {t('portal.farmer.common.tryAgain')}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl border p-5 shadow-soft ${
                  card.accent ? 'border-ink bg-ink' : 'border-line bg-card'
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    card.accent ? 'bg-brand-600 text-white' : 'bg-page text-ink'
                  }`}
                >
                  <Icon path={card.icon} />
                </span>
                <p
                  className={`mt-4 font-bold tracking-tight tabular-nums ${
                    String(card.value).startsWith('RWF') ? 'text-2xl' : 'text-3xl'
                  } ${card.accent ? 'text-white' : 'text-ink'} ${
                    loading ? 'animate-pulse text-transparent' : ''
                  }`}
                >
                  {loading ? 'Loading' : card.value}
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

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <section className="rounded-2xl border border-line bg-card shadow-soft xl:col-span-3">
              <div className="border-b border-line px-6 py-4">
                <h2 className="text-sm font-semibold text-ink">
                  {t('portal.farmer.report.byCrop')}
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  {t('portal.farmer.report.byCropText')}
                </p>
              </div>

              {loading ? (
                <div className="space-y-3 p-6">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : byCrop.length === 0 ? (
                 <div className="px-6 py-16 text-center text-sm text-muted">
                   {t('portal.farmer.report.noMatch')}
                 </div>
              ) : (
                <div className="divide-y divide-line">
                  {byCrop.map((crop) => (
                    <div key={crop.cropName} className="px-6 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{crop.cropName}</p>
                          <p className="text-xs text-muted">
                             {crop.harvests} {t('portal.farmer.report.harvests')} ·{' '}
                             {Number(crop.quantityKg).toLocaleString()} {t('portal.farmer.common.kg')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold tabular-nums text-ink">
                            {formatCurrency(crop.value)}
                          </p>
                          <p className="text-xs text-gray-400">
                             {t('portal.farmer.report.avg')}{' '}
                             {formatCurrency(crop.averagePrice)}/{t('portal.farmer.common.kg')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-page">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${Math.min(100, crop.share || 0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-line bg-card shadow-soft xl:col-span-2">
              <div className="border-b border-line px-6 py-4">
                <h2 className="text-sm font-semibold text-ink">
                  {t('portal.farmer.report.monthlyValue')}
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  {t('portal.farmer.report.monthlyText')}
                </p>
              </div>

              {loading ? (
                <div className="space-y-3 p-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : monthly.length === 0 ? (
                 <div className="px-6 py-16 text-center text-sm text-muted">
                   {t('portal.farmer.report.noMonthly')}
                 </div>
              ) : (
                <div className="space-y-4 p-6">
                  {monthly.map((month) => (
                    <div key={month.month}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                        <span className="font-medium text-ink">{monthLabel(month.month)}</span>
                        <span className="font-semibold tabular-nums text-muted">
                          {formatCurrency(month.value)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-page">
                        <div
                          className="h-full rounded-full bg-ink"
                          style={{
                            width: `${Math.max(
                              4,
                              (Number(month.value) / maxMonthlyValue) * 100
                            )}%`
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-gray-400">
                         {Number(month.quantityKg).toLocaleString()} {t('portal.farmer.common.kg')} ·{' '}
                        {month.harvests} {t('portal.farmer.report.harvests')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-card px-5 py-4 text-xs text-muted shadow-soft">
            <span className="font-semibold text-ink">
              {t('portal.farmer.report.statusMix')}
            </span>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">
              {summary.activeCount || 0} {t('portal.farmer.common.active').toLowerCase()}
            </span>
            <span className="rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-sky-600">
              {summary.soldCount || 0} {t('portal.farmer.common.sold').toLowerCase()}
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-500">
              {summary.hiddenCount || 0} hidden
            </span>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-600">
              {summary.expiredCount || 0} expired
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default HarvestReportPage
