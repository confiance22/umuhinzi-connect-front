/**
 * StockOutReportPage — Stock Out Report: all outbound inventory.
 * Reason breakdown table plus the line-by-line outbound ledger
 * (Date, Product, Quantity Removed, Reason, Total Value).
 */
import React from 'react'
import createReportPage from '../../components/reports/createReportPage'
import ReportTable from '../../components/reports/ReportTable'
import SectionHeader from '../../components/reports/SectionHeader'
import { formatCurrency } from '../../utils/formatCurrency'
import { buildTotalsRow } from '../../utils/reportTotals'
import { commaN, fmtDate, fmtQty, formatCurrencyTotals, stamp } from '../../components/reports/helpers'

const ICONS = {
  dispatched: 'M12 15V3m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  value: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  movements: 'M3 3v18h18M18 17V9m-6 8V5m-6 12v-4',
  reasons: 'M3 10h18M6 6h.01M9 6h.01M12 6h.01M16 6h.01M20 6h.01M3 14h18M6 14h.01M9 14h.01M12 14h.01M16 14h.01M20 14h.01M3 18h18M6 18h.01M9 18h.01M12 18h.01M16 18h.01M20 18h.01',
  period: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
}

const DETAIL_HEADERS = ['Date', 'Product', 'SKU', 'Qty Removed', 'Reason', 'Total Value', 'Customer', 'Removed By']
const DETAIL_ALIGNMENTS = ['left', 'left', 'left', 'right', 'left', 'right', 'left', 'left']

const rowOf = (m) => [fmtDate(m.date), m.product, m.sku, fmtQty(m.qty, m.unit), m.reason ? m.reason.toUpperCase() : '—', formatCurrency(m.value), m.customer || '—', m.actor]

export default createReportPage({
  eyebrow: 'Outbound Movement Report',
  title: 'Stock Out Report',
  description: 'Detailed table of all outbound inventory — every unit removed with its reason (Sale / Damage / Transfer), the customer who took it, and total value.',
  buildCards: (data, ctx) => {
    const stockOut = data?.stockOut || []
    const reasonBreakdown = data?.reasonBreakdown || []
    return [
      { label: 'Total Units Dispatched', value: `${commaN(stockOut.reduce((x, m) => x + m.qty, 0))} units`, sub: 'Outbound quantity this period', icon: ICONS.dispatched },
      { label: 'Outbound Stock Value', value: `RWF ${commaN(stockOut.reduce((x, m) => x + m.value, 0))}`, sub: 'Value of goods removed', icon: ICONS.value, accent: true },
      { label: 'Outbound Movements', value: `${commaN(stockOut.length)} records`, sub: 'Individual dispatches logged', icon: ICONS.movements },
      { label: 'Removal Reasons', value: `${commaN(reasonBreakdown.length)} types`, sub: 'Sale / Damage / Transfer', icon: ICONS.reasons },
      { label: 'Dispatch Period', value: ctx.periodLabel, sub: 'Reporting window', icon: ICONS.period },
    ]
  },
  buildChildren: (data, ctx) => {
    const stockOut = data?.stockOut || []
    const reasonBreakdown = data?.reasonBreakdown || []
    return (
      <div className="space-y-5">
        {reasonBreakdown.length > 0 && (
          <div className="space-y-3">
            <SectionHeader eyebrow="Reason Summary" title="Breakdown by Reason" />
            <ReportTable
              headers={['Reason', 'Movements', 'Units Removed', 'Outbound Value']}
              rows={reasonBreakdown.map((r) => [r.reason, commaN(r.movements), commaN(r.units), formatCurrency(r.value)])}
              alignments={['left', 'right', 'right', 'right']}
              totalsRow={formatCurrencyTotals(
                buildTotalsRow(
                  ['Reason', 'Movements', 'Units Removed', 'Outbound Value'],
                  reasonBreakdown.map((r) => [r.reason, r.movements, r.units, r.value])
                ),
                [3]
              )}
              emptyMessage="No outbound stock in this period."
            />
          </div>
        )}

        <div className="space-y-3">
          <SectionHeader eyebrow="Line Items" title="Outbound Movement Detail" description={`Every dispatch logged in ${ctx.periodLabel}.`} />
          <ReportTable
            headers={DETAIL_HEADERS}
            rows={stockOut.map(rowOf)}
            alignments={DETAIL_ALIGNMENTS}
            totalsRow={formatCurrencyTotals(
              buildTotalsRow(DETAIL_HEADERS, stockOut.map((m) => [m.date, m.product, m.sku, m.qty, m.reason, m.value, m.customer, m.actor])),
              [5]
            )}
            emptyMessage="No outbound stock in this period."
          />
        </div>
      </div>
    )
  },
  buildExport: (data, ctx) => {
    const { periodLabel } = ctx
    const stockOut = data?.stockOut || []
    const reasonBreakdown = data?.reasonBreakdown || []
    const rows = stockOut.map(rowOf)
    return {
      reportTitle: 'Stock Out Report',
      subtitle: 'Outbound inventory only — every unit removed with its reason (Sale / Damage / Transfer), the customer who took it, and total value, plus a reason breakdown.',
      headers: DETAIL_HEADERS,
      rows,
      alignments: DETAIL_ALIGNMENTS,
      totalsRow: formatCurrencyTotals(buildTotalsRow(DETAIL_HEADERS, rows), [5]),
      summaryCards: [
        { label: 'Total Units Dispatched', value: `${commaN(stockOut.reduce((x, m) => x + m.qty, 0))} units` },
        { label: 'Outbound Stock Value', value: `RWF ${commaN(stockOut.reduce((x, m) => x + m.value, 0))}` },
        { label: 'Outbound Movements', value: `${commaN(stockOut.length)} records` },
        { label: 'Removal Reasons', value: `${commaN(reasonBreakdown.length)} types` },
        { label: 'Dispatch Period', value: periodLabel },
      ],
      filename: stamp('Stock-Out', periodLabel),
    }
  },
})