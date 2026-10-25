/**
 * OverviewReportPage — Overall Summary: executive dashboard.
 * Metric cards (opening/closing stock value, total in/out, net flow)
 * above a category-level capital breakdown table with donut chart.
 * This is the default landing page for the Reports section.
 */
import React from 'react'
import createReportPage from '../../components/reports/createReportPage'
import ReportTable from '../../components/reports/ReportTable'
import SectionHeader from '../../components/reports/SectionHeader'
import DonutChart from '../../components/charts/DonutChart'
import { formatCurrency } from '../../utils/formatCurrency'
import { buildTotalsRow } from '../../utils/reportTotals'
import { commaN, formatCurrencyTotals, statusOfValue, stamp } from '../../components/reports/helpers'

const ICONS = {
  opening: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  in: 'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  out: 'M12 15V3m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  flow: 'M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4',
  closing: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
}

export default createReportPage({
  eyebrow: 'Executive Dashboard',
  title: 'Overall Summary',
  description:
    'Executive dashboard — opening vs closing stock value, total stock in and out (units & value), net flow and the category-level capital split.',
  buildCards: (data, ctx) => {
    const s = data?.summary || {}
    return [
      { label: 'Opening Stock Value', value: `RWF ${commaN(s.openingStockValue ?? 0)}`, sub: 'Valuation at period start', icon: ICONS.opening },
      { label: 'Total Stock In', value: `${commaN(s.totalStockInUnits ?? 0)} units`, sub: `RWF ${commaN(s.totalInValue ?? 0)} value added`, icon: ICONS.in },
      { label: 'Total Stock Out', value: `${commaN(s.totalStockOutUnits ?? 0)} units`, sub: `RWF ${commaN(s.totalOutValue ?? 0)} value removed`, icon: ICONS.out },
      { label: 'Net Flow', value: `${(s.netFlow ?? 0) >= 0 ? '+' : ''}${commaN(s.netFlow ?? 0)} units`, sub: 'Inbound minus outbound', icon: ICONS.flow },
      { label: 'Closing Stock Value', value: `RWF ${commaN(s.closingStockValue ?? s.totalValuation ?? 0)}`, sub: 'Current inventory valuation', icon: ICONS.closing, accent: true },
    ]
  },
  buildChildren: (data, ctx) => {
    const categoryBreakdown = data?.categoryBreakdown || []
    const rows = categoryBreakdown.map((c) => [
      c.category,
      commaN(c.productCount),
      commaN(c.quantity),
      formatCurrency(c.value),
      `${c.percentage}%`,
      statusOfValue(c.percentage).label,
    ])
    const totalsRow = formatCurrencyTotals(
      buildTotalsRow(
        ['Category', 'Products', 'Units in Stock', 'Valuation', '% of Total', 'Status'],
        categoryBreakdown.map((c) => [c.category, c.productCount, c.quantity, c.value, c.percentage])
      ),
      [3]
    )
    return (
      <div className="space-y-5">
        <SectionHeader eyebrow="Category Breakdown" title="Valuation by Category" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2">
            <DonutChart
              title="Category Capital Weight"
              subtitle="Share of total stock value by category."
              data={categoryBreakdown.map((c) => ({ label: c.category, value: c.value }))}
              valuePrefix="RWF "
              height="h-80"
            />
          </div>
          <div className="lg:col-span-3">
            <ReportTable
              headers={['Category', 'Products', 'Units in Stock', 'Valuation', '% of Total', 'Status']}
              rows={rows}
              alignments={['left', 'right', 'right', 'right', 'right', 'center']}
              totalsRow={totalsRow}
              statusCols={[5]}
              emptyMessage="No categories recorded yet."
            />
          </div>
        </div>
      </div>
    )
  },
  buildExport: (data, ctx) => {
    const { periodLabel } = ctx
    const categoryBreakdown = data?.categoryBreakdown || []
    const s = data?.summary || {}
    const headers = ['Category', 'Products', 'Units in Stock', 'Valuation', '% of Total', 'Status']
    const rows = categoryBreakdown.map((c) => [
      c.category,
      commaN(c.productCount),
      commaN(c.quantity),
      formatCurrency(c.value),
      `${c.percentage}%`,
      statusOfValue(c.percentage).label,
    ])
    return {
      reportTitle: 'Overall Stock Summary',
      subtitle:
        'Executive summary — opening vs closing stock value, total stock in and out (units & value), net flow and category-level capital distribution.',
      headers,
      rows,
      alignments: ['left', 'right', 'right', 'right', 'right', 'center'],
      totalsRow: formatCurrencyTotals(buildTotalsRow(headers, rows), [3]),
      barCols: [4],
      statusCols: [5],
      summaryCards: [
        { label: 'Opening Stock Value', value: `RWF ${commaN(s.openingStockValue ?? 0)}` },
        { label: 'Total Stock In', value: `${commaN(s.totalStockInUnits ?? 0)} units · RWF ${commaN(s.totalInValue ?? 0)}` },
        { label: 'Total Stock Out', value: `${commaN(s.totalStockOutUnits ?? 0)} units · RWF ${commaN(s.totalOutValue ?? 0)}` },
        { label: 'Net Flow', value: `${(s.netFlow ?? 0) >= 0 ? '+' : ''}${commaN(s.netFlow ?? 0)} units` },
        { label: 'Closing Stock Value', value: `RWF ${commaN(s.closingStockValue ?? s.totalValuation ?? 0)}` },
      ],
      filename: stamp('Overall-Summary', periodLabel),
    }
  },
})