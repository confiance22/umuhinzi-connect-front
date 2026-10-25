/**
 * StockInReportPage — Stock In Report: all inbound inventory.
 * Supplier breakdown table plus the line-by-line inbound ledger
 * (Date, Product, Quantity Received, Unit Cost, Total Cost, Supplier).
 */
import React from 'react'
import createReportPage from '../../components/reports/createReportPage'
import ReportTable from '../../components/reports/ReportTable'
import SectionHeader from '../../components/reports/SectionHeader'
import { formatCurrency } from '../../utils/formatCurrency'
import { buildTotalsRow } from '../../utils/reportTotals'
import { commaN, fmtDate, fmtQty, formatCurrencyTotals, stamp } from '../../components/reports/helpers'

const ICONS = {
  received: 'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  value: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  movements: 'M3 3v18h18M18 17V9m-6 8V5m-6 12v-4',
  suppliers: 'M20 21v-2a4 4 0 0 0-3-3.87m3-8.13a4 4 0 1 1 0 7.75m-7.13-15.62a4 4 0 1 1-3.74 6.62M12 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2',
  period: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
}

const DETAIL_HEADERS = ['Date', 'Product', 'SKU', 'Cartons', 'Pieces', 'Qty Received', 'Unit Cost', 'Total Cost', 'Supplier', 'Received By']
const DETAIL_ALIGNMENTS = ['left', 'left', 'left', 'right', 'right', 'right', 'right', 'right', 'left', 'left']

export default createReportPage({
  eyebrow: 'Inbound Movement Report',
  title: 'Stock In Report',
  description: 'Detailed table of all inbound inventory — every receipt with quantity received, unit cost, total cost and supplier.',
  buildCards: (data, ctx) => {
    const stockIn = data?.stockIn || []
    const supplierBreakdown = data?.supplierBreakdown || []
    return [
      { label: 'Total Units Received', value: `${commaN(stockIn.reduce((x, m) => x + m.qty, 0))} units`, sub: 'Inbound quantity this period', icon: ICONS.received },
      { label: 'Inbound Stock Value', value: `RWF ${commaN(stockIn.reduce((x, m) => x + m.value, 0))}`, sub: 'Value of goods received', icon: ICONS.value, accent: true },
      { label: 'Inbound Movements', value: `${commaN(stockIn.length)} records`, sub: 'Individual receipts logged', icon: ICONS.movements },
      { label: 'Suppliers Used', value: `${commaN(supplierBreakdown.length)} active`, sub: 'Distinct suppliers this period', icon: ICONS.suppliers },
      { label: 'Receiving Period', value: ctx.periodLabel, sub: 'Reporting window', icon: ICONS.period },
    ]
  },
  buildChildren: (data, ctx) => {
    const stockIn = data?.stockIn || []
    const supplierBreakdown = data?.supplierBreakdown || []
    return (
      <div className="space-y-5">
        {supplierBreakdown.length > 0 && (
          <div className="space-y-3">
            <SectionHeader eyebrow="Supplier Summary" title="Breakdown by Supplier" />
            <ReportTable
              headers={['Supplier', 'Movements', 'Units Received', 'Inbound Value']}
              rows={supplierBreakdown.map((s) => [s.supplier, commaN(s.movements), commaN(s.units), formatCurrency(s.value)])}
              alignments={['left', 'right', 'right', 'right']}
              totalsRow={formatCurrencyTotals(
                buildTotalsRow(
                  ['Supplier', 'Movements', 'Units Received', 'Inbound Value'],
                  supplierBreakdown.map((s) => [s.supplier, s.movements, s.units, s.value])
                ),
                [3]
              )}
              emptyMessage="No inbound stock in this period."
            />
          </div>
        )}

        <div className="space-y-3">
          <SectionHeader eyebrow="Line Items" title="Inbound Movement Detail" description={`Every receipt logged in ${ctx.periodLabel}.`} />
          <ReportTable
            headers={DETAIL_HEADERS}
            rows={stockIn.map((m) => [
              fmtDate(m.date),
              m.product,
              m.sku,
              commaN(m.cartons),
              commaN(m.pieces),
              fmtQty(m.qty, m.unit),
              formatCurrency(m.pieceCost ?? 0),
              formatCurrency(m.value),
              m.supplier || '—',
              m.actor,
            ])}
            alignments={DETAIL_ALIGNMENTS}
            totalsRow={formatCurrencyTotals(
              buildTotalsRow(DETAIL_HEADERS, stockIn.map((m) => [m.date, m.product, m.sku, m.cartons, m.pieces, m.qty, m.pieceCost, m.value, m.supplier, m.actor])),
              [7]
            )}
            emptyMessage="No inbound stock in this period."
          />
        </div>
      </div>
    )
  },
  buildExport: (data, ctx) => {
    const { periodLabel } = ctx
    const stockIn = data?.stockIn || []
    const supplierBreakdown = data?.supplierBreakdown || []
    const rows = stockIn.map((m) => [
      fmtDate(m.date),
      m.product,
      m.sku,
      commaN(m.cartons),
      commaN(m.pieces),
      fmtQty(m.qty, m.unit),
      formatCurrency(m.pieceCost ?? 0),
      formatCurrency(m.value),
      m.supplier || '—',
      m.actor,
    ])
    return {
      reportTitle: 'Stock In Report',
      subtitle: 'Inbound inventory only — every receipt with quantity, unit cost and total cost per movement, plus a supplier breakdown.',
      headers: DETAIL_HEADERS,
      rows,
      alignments: DETAIL_ALIGNMENTS,
      totalsRow: formatCurrencyTotals(buildTotalsRow(DETAIL_HEADERS, rows), [7]),
      summaryCards: [
        { label: 'Total Units Received', value: `${commaN(stockIn.reduce((x, m) => x + m.qty, 0))} units` },
        { label: 'Inbound Stock Value', value: `RWF ${commaN(stockIn.reduce((x, m) => x + m.value, 0))}` },
        { label: 'Inbound Movements', value: `${commaN(stockIn.length)} records` },
        { label: 'Suppliers Used', value: `${commaN(supplierBreakdown.length)} active` },
        { label: 'Receiving Period', value: periodLabel },
      ],
      filename: stamp('Stock-In', periodLabel),
    }
  },
})