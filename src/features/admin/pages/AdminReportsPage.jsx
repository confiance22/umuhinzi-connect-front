/**
 * AdminReportsPage — platform-wide reports for the Super Admin.
 * KPIs from /admin/reports/overview, shop breakdown from /admin/reports/shops,
 * and registration/activity trends from /admin/reports/trends.
 */
import React, { useState, useEffect, useMemo } from 'react'
import { adminApi } from '../../../api/adminApi'
import { useAuth } from '../../../hooks/useAuth'
import { useToastContext } from '../../../context/ToastContext'
import { Table } from '../../../components/common/Table'
import BarChart from '../../../components/charts/BarChart'
import DonutChart from '../../../components/charts/DonutChart'
import ExportActions from '../../../components/reports/ExportActions'
import { exportReportPDF } from '../../../utils/exportToPDF'
import { exportToXLS } from '../../../utils/exportSpreadsheet'
import { exportToCSV } from '../../../utils/exportToCSV'
import formatCurrency from '../../../utils/formatCurrency'

const EMPTY_OVERVIEW = {
  shops: { total: 0, pending: 0, approved: 0, rejected: 0 },
  users: { total: 0, active: 0, disabled: 0, locked: 0, byRole: {} },
  platform: { products: 0, movements: 0, checks: 0, notifications: 0 },
}

const DAY_OPTIONS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
]

export const AdminReportsPage = () => {
  const { showToast } = useToastContext()
  const { user } = useAuth()
  const [overview, setOverview] = useState(EMPTY_OVERVIEW)
  const [shops, setShops] = useState([])
  const [trends, setTrends] = useState([])
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async (trendDays = days) => {
    setLoading(true)
    setError(null)
    try {
      const [overviewRes, shopsRes, trendsRes] = await Promise.allSettled([
        adminApi.getReportsOverview(),
        adminApi.getReportsShops(),
        adminApi.getReportsTrends(trendDays),
      ])
      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value)
      else if (overviewRes.reason) toastError(overviewRes.reason)
      setShops(shopsRes.status === 'fulfilled' && Array.isArray(shopsRes.value) ? shopsRes.value : [])
      if (trendsRes.status === 'fulfilled') {
        setTrends(Array.isArray(trendsRes.value?.buckets) ? trendsRes.value.buckets : [])
      }
      const anyFailed = [overviewRes, shopsRes, trendsRes].some((r) => r.status === 'rejected')
      if (anyFailed) setError('Some report sections could not be loaded.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toastError = (err) => showToast(err?.message || 'Could not load platform reports', 'error')

  useEffect(() => {
    load(days)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeDays = (next) => {
    setDays(next)
    load(next)
  }

  /* Platform export spec — executive black & gold skin ('platform') so Super
     Admin exports are visibly distinct from shop-manager teal reports. */
  const exportSpec = useMemo(() => {
    const staffM = shops.reduce((s, e) => s + (e.users?.managers || 0), 0)
    const staffW = shops.reduce((s, e) => s + (e.users?.workers || 0), 0)
    const productsTotal = shops.reduce((s, e) => s + (e.products || 0), 0)
    const movementsTotal = shops.reduce((s, e) => s + (e.movements || 0), 0)
    const stockValueTotal = shops.reduce((s, e) => s + (Number(e.stockValue) || 0), 0)
    const periodLabel = `Last ${days} days`
    const headers = ['Shop', 'Staff', 'Products', 'Movements', 'Stock Value']
    const rows = shops.map((e) => [
      e.name,
      `${e.users?.managers || 0} m · ${e.users?.workers || 0} w`,
      e.products,
      e.movements,
      formatCurrency(e.stockValue),
    ])
    return {
      skin: 'platform',
      shopName: 'StockRwa Platform',
      reportTitle: 'Platform Report',
      subtitle:
        'Super Admin platform analytics — shop growth, user distribution, inventory activity and stock value across every shop.',
      periodLabel,
      generatedBy: user?.name || 'Super Admin',
      headers,
      rows,
      alignments: ['left', 'center', 'right', 'right', 'right'],
      barCols: [3],
      totalsRow: ['TOTAL', `${staffM} m · ${staffW} w`, productsTotal, movementsTotal, formatCurrency(stockValueTotal)],
      summaryCards: [
        { label: 'Total Shops', value: `${overview.shops?.total || 0} · ${overview.shops?.approved || 0} approved` },
        { label: 'Total Users', value: `${overview.users?.total || 0}` },
        { label: 'Stock Movements', value: `${overview.platform?.movements || 0}` },
        { label: 'Products Tracked', value: `${overview.platform?.products || 0}` },
        { label: 'Platform Stock Value', value: formatCurrency(stockValueTotal) },
      ],
      filename: `StockRwa-Platform-Report-${days}d`,
    }
  }, [overview, shops, days, user])

  const runExport = async (kind) => {
    if (!exportSpec || !exportSpec.rows.length) {
      showToast('Nothing to export yet', 'info')
      return
    }
    try {
      if (kind === 'excel') {
        await exportToXLS(exportSpec)
        showToast('Platform report exported as Excel', 'success')
      } else if (kind === 'pdf') {
        await exportReportPDF(exportSpec)
        showToast('Platform report exported as PDF', 'success')
      } else {
        exportToCSV(exportSpec.headers, exportSpec.rows, exportSpec.filename, {
          appName: 'StockRwa — Platform Administration',
          classification: 'CONFIDENTIAL — PLATFORM REPORT',
          shopName: exportSpec.shopName,
          reportTitle: exportSpec.reportTitle,
          periodLabel: exportSpec.periodLabel,
          generatedBy: exportSpec.generatedBy,
          totalsRow: exportSpec.totalsRow,
        })
        showToast('Platform report exported as CSV', 'success')
      }
    } catch (err) {
      showToast(err?.message || 'Export failed', 'error')
    }
  }

  const roleDonut = useMemo(() => {
    const byRole = overview.users?.byRole || {}
    const labels = { shop_manager: 'Managers', worker: 'Workers', super_admin: 'Super Admins' }
    return Object.entries(byRole).map(([key, value]) => ({
      label: labels[key] || key,
      value,
    }))
  }, [overview.users])

  const shopDonut = useMemo(() => {
    const s = overview.shops || {}
    return [
      { label: 'Approved', value: s.approved, color: '#65a30d' },
      { label: 'Pending', value: s.pending, color: '#F59E0B' },
      { label: 'Rejected', value: s.rejected, color: '#EF4444' },
    ].filter((d) => d.value > 0)
  }, [overview.shops])

  const kpiCards = [
    {
      label: 'Total Shops',
      value: overview.shops?.total || 0,
      sub: `${overview.shops?.approved || 0} approved · ${overview.shops?.pending || 0} pending`,
      accent: true,
      icon: 'M3 9l1.5-4h15L21 9M4 9v11h16V9M4 9h16M9 20v-6h6v6',
    },
    {
      label: 'Total Users',
      value: overview.users?.total || 0,
      sub: `${overview.users?.active || 0} active · ${overview.users?.locked || 0} locked`,
      icon: 'M17 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
    {
      label: 'Stock Movements',
      value: overview.platform?.movements || 0,
      sub: 'All-time recorded',
      icon: 'M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6',
    },
    {
      label: 'Products Tracked',
      value: overview.platform?.products || 0,
      sub: `${overview.platform?.checks || 0} stock counts`,
      icon: 'M20.59 13.41 8 26 4 22l12.59-12.59M16 3a4 4 0 0 1 4 4l-9 9-4-4z',
    },
  ]

  const shopColumns = [
    {
      key: 'name',
      header: 'Shop',
      sortable: true,
      sortValue: (e) => e.name || '',
      render: (e) => (
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-full bg-[#d9f99d] text-[#0f3d25] text-[13px] font-semibold flex items-center justify-center shrink-0">
            {(e.name || '?').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-ink truncate max-w-[200px]">{e.name}</p>
            <p className="text-xs text-gray-400 font-mono truncate">{e.code || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'users',
      header: 'Staff',
      sortable: true,
      sortValue: (e) => (e.users?.managers || 0) + (e.users?.workers || 0),
      render: (e) => (
        <span className="text-sm text-ink">{`${e.users?.managers || 0} m · ${e.users?.workers || 0} w`}</span>
      ),
    },
    {
      key: 'products',
      header: 'Products',
      sortable: true,
      render: (e) => <span className="text-sm text-ink">{e.products}</span>,
    },
    {
      key: 'movements',
      header: 'Movements',
      sortable: true,
      render: (e) => <span className="text-sm text-ink">{e.movements}</span>,
    },
    {
      key: 'stockValue',
      header: 'Stock Value',
      sortable: true,
      sortValue: (e) => Number(e.stockValue) || 0,
      render: (e) => <span className="text-sm text-ink tabular-nums">{formatCurrency(e.stockValue)}</span>,
    },
  ]

  if (loading && !overview.shops.total && shops.length === 0) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200/70 rounded-2xl" />
          ))}
        </div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200/70 rounded-2xl" />
          <div className="h-80 bg-gray-200/70 rounded-2xl" />
        </div>
        <div className="h-80 bg-gray-200/70 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-[#3f6212] bg-[#d9f99d]/20 px-2.5 py-1 rounded-full">
            Platform Analytics
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">Reports</h1>
          <p className="text-sm text-muted mt-1">Growth, distribution, and activity across every shop on the platform.</p>
        </div>
        <div className="flex flex-col items-stretch sm:items-end gap-3">
          <div className="flex items-center gap-1 rounded-full border border-line bg-[#efe7d6] p-1 shadow-soft">
            {DAY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => changeDays(opt.value)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                  days === opt.value ? 'bg-[#d9f99d] text-[#0f3d25]' : 'text-muted hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <ExportActions
            onExcel={() => runExport('excel')}
            onPDF={() => runExport('pdf')}
            onCSV={() => runExport('csv')}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`relative rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
              card.accent ? 'bg-ink border-ink' : 'bg-[#efe7d6] border-line shadow-soft'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.accent ? 'bg-[#d9f99d] text-[#0f3d25]' : 'bg-page text-ink'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </span>
            </div>
            <p className={`text-3xl font-bold tracking-tight tabular-nums mt-4 ${card.accent ? 'text-white' : 'text-ink'}`}>{card.value}</p>
            <p className={`text-sm font-medium mt-0.5 ${card.accent ? 'text-white/80' : 'text-muted'}`}>{card.label}</p>
            <p className={`text-xs mt-2 ${card.accent ? 'text-white/50' : 'text-muted'}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart
          title="Shop Approval Status"
          subtitle="Distribution of shops by approval state"
          data={shopDonut}
          centerLabel="Shops"
          loading={loading}
        />
        <DonutChart
          title="User Role Distribution"
          subtitle="How accounts split across roles"
          data={roleDonut}
          centerLabel="Users"
          loading={loading}
        />
      </div>

      <BarChart
        title="Platform Activity Trends"
        subtitle={`Shops, users & movements created daily (last ${days} days)`}
        data={trends}
        series={[
          { key: 'shops', label: 'Shops', color: '#65a30d' },
          { key: 'users', label: 'Users', color: '#0EA5E9' },
          { key: 'movements', label: 'Movements', color: '#F59E0B' },
        ]}
        emptyText={`No activity recorded in the last ${days} days`}
        loading={loading}
      />

      <Table
        title="Shop Performance"
        subtitle="Users, product counts, activity and stock value per shop"
        columns={shopColumns}
        rows={shops}
        loading={loading}
        emptyTitle="No shops yet"
        emptyMessage="Shops appear here once they register on the platform."
        minWidth={820}
        rowLabel="shops"
      />
    </div>
  )
}

export default AdminReportsPage