/**
 * createReportPage — config-driven base for the four report pages.
 * Each report (Overall Summary / Stock In / Stock Out / All Products) is a
 * distinct routed page that shares this shell: branded page header with the
 * date-range selector, dashboard-style metric cards and the branded striped
 * tables — plus Excel / PDF / CSV exports.
 *
 * A page only supplies:
 *   buildCards(data, ctx)    → metric card items
 *   buildChildren(data, ctx) → the tables/visuals below the cards
 *   buildExport(data, ctx)   → the export spec handed to the exporters
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { reportApi } from '../../api/reportApi'
import { authApi } from '../../api/authApi'
import { useAuth } from '../../hooks/useAuth'
import { useToastContext } from '../../context/ToastContext'
import { toIsoDay, formatDateShort, shopDisplayName } from '../../utils/branding'
import { exportToCSV } from '../../utils/exportToCSV'
import { exportReportPDF } from '../../utils/exportToPDF'
import { exportToXLS } from '../../utils/exportSpreadsheet'
import MetricCards from './MetricCards'
import ExportActions from './ExportActions'

const TIME_RANGES = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom' },
]

export default function createReportPage({ eyebrow, title, description, buildCards, buildChildren, buildExport }) {
  const ReportPageComponent = () => {
    const { user } = useAuth()
    const { showToast } = useToastContext()
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('7d')
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')
    const [profile, setProfile] = useState(null)

    useEffect(() => {
      authApi
        .getCurrentUser()
        .then(setProfile)
        .catch(() => setProfile(null))
    }, [])

    const params = useMemo(() => {
      if (timeRange === 'all') return {}
      const end = new Date()
      if (timeRange === 'custom') {
        if (!customStart || !customEnd) return {}
        return { startDate: customStart, endDate: customEnd }
      }
      const start = new Date()
      if (timeRange === '7d') start.setDate(start.getDate() - 6)
      else if (timeRange === '30d') start.setDate(start.getDate() - 29)
      else if (timeRange === 'month') start.setDate(1)
      return { startDate: toIsoDay(start), endDate: toIsoDay(end) }
    }, [timeRange, customStart, customEnd])

    const periodLabel = useMemo(() => {
      if (timeRange === 'all') return 'All recorded activity'
      if (timeRange === 'custom') {
        if (!customStart || !customEnd) return 'Custom range'
        return `${formatDateShort(new Date(`${customStart}T00:00:00`))} — ${formatDateShort(new Date(`${customEnd}T00:00:00`))}`
      }
      return `${formatDateShort(new Date(`${params.startDate}T00:00:00`))} — ${formatDateShort(new Date(`${params.endDate}T00:00:00`))}`
    }, [timeRange, customStart, customEnd, params])

    useEffect(() => {
      let cancelled = false
      if (timeRange === 'custom' && (!customStart || !customEnd)) {
        setIsLoading(false)
        return () => {
          cancelled = true
        }
      }
      setIsLoading(true)
      reportApi
        .getFullReport(params)
        .then((res) => {
          if (cancelled) return
          setData(res)
          setIsLoading(false)
        })
        .catch((err) => {
          if (cancelled) return
          console.error('Failed to load reports:', err)
          showToast('Could not load report analytics', 'error')
          setIsLoading(false)
        })
      return () => {
        cancelled = true
      }
    }, [params, timeRange, customStart, customEnd, showToast])

    const summary = data?.summary || {}
    const shopName = shopDisplayName(profile || user)
    const generatedBy = profile?.name || user?.name || 'Shop Manager'

    const ctx = useMemo(
      () => ({
        shopName,
        generatedBy,
        periodLabel,
        summary,
      }),
      [shopName, generatedBy, periodLabel, summary]
    )

    const spec = useMemo(() => (data ? buildExport(data, ctx) : null), [data, ctx, buildExport])

    const handleExportExcel = useCallback(async () => {
      if (!spec) return
      try {
        await exportToXLS({ ...ctx, ...spec })
        showToast(`${spec.reportTitle} exported as Excel`, 'success')
      } catch (err) {
        showToast(err?.message || 'Excel export failed', 'error')
      }
    }, [spec, ctx, showToast])

    const handleExportPDF = useCallback(async () => {
      if (!spec) return
      try {
        await exportReportPDF({ ...ctx, ...spec })
        showToast(`${spec.reportTitle} exported as PDF`, 'success')
      } catch (err) {
        showToast(err?.message || 'PDF export failed', 'error')
      }
    }, [spec, ctx, showToast])

    const handleExportCSV = useCallback(() => {
      if (!spec) return
      try {
        exportToCSV(spec.headers, spec.rows, spec.filename, {
          appName: 'StockRwa — Inventory Control & Audit System',
          shopName,
          reportTitle: spec.reportTitle,
          periodLabel,
          generatedBy,
          totalsRow: spec.totalsRow,
        })
        showToast(`${spec.reportTitle} exported as CSV`, 'success')
      } catch (err) {
        showToast(err?.message || 'CSV export failed', 'error')
      }
    }, [spec, shopName, periodLabel, generatedBy, showToast])

    if (isLoading && !data) {
      return (
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-xl bg-gray-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-200/70" />
            ))}
          </div>
          <div className="h-72 rounded-2xl bg-gray-200/60" />
        </div>
      )
    }

    const cards = data ? buildCards(data, ctx) : []

    return (
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-medium uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
              {eyebrow}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">{title}</h1>
            <p className="text-sm text-muted mt-1">{description}</p>
          </div>

          {/* Date range + export actions */}
          <div className="flex flex-col items-stretch sm:items-end gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1 bg-page rounded-full p-1">
                {TIME_RANGES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setTimeRange(r.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      timeRange === r.id ? 'bg-white text-ink shadow-soft' : 'text-gray-400 hover:text-ink'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            {spec && <ExportActions onExcel={handleExportExcel} onPDF={handleExportPDF} onCSV={handleExportCSV} />}
          </div>
        </div>

        {/* Custom date range panel */}
        <AnimatePresence>
          {timeRange === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-brand-700/20 bg-brand-700/5 p-4 flex flex-col sm:flex-row sm:items-end gap-3">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-[0.14em] text-brand-600 mb-1.5">From</label>
                  <input
                    type="date"
                    value={customStart}
                    max={customEnd || toIsoDay()}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="h-11 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-[0.14em] text-brand-600 mb-1.5">To</label>
                  <input
                    type="date"
                    value={customEnd}
                    min={customStart}
                    max={toIsoDay()}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="h-11 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25"
                  />
                </div>
                <button
                  onClick={() => setTimeRange('7d')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-brand-700 transition-[transform,background-color,color] duration-150 hover:bg-page active:scale-[0.98]"
                >
                  Reset to 7 days
                </button>
                <p className="sm:ml-auto sm:text-right text-xs text-muted sm:max-w-[220px]">
                  {customStart && customEnd ? `Showing ${periodLabel}` : 'Pick both dates to load the report.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metric cards + page-specific content */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {cards.length > 0 && <MetricCards items={cards} />}
          {data && buildChildren(data, ctx)}
        </motion.div>
      </div>
    )
  }
  return ReportPageComponent
}