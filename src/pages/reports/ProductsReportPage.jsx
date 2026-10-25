/**
 * ProductsReportPage — All Products: master inventory list.
 * Report columns in shop-manager order: Product Name (with its circular
 * photo), SKU / Barcode, Price per Piece (RWF), Carton Price, Pieces per
 * Carton and Cartons on hand — mirroring the Add Product form.
 */
import React from 'react'
import createReportPage from '../../components/reports/createReportPage'
import ReportTable from '../../components/reports/ReportTable'
import SectionHeader from '../../components/reports/SectionHeader'
import { formatCurrency } from '../../utils/formatCurrency'
import { commaN, stamp } from '../../components/reports/helpers'

const ICONS = {
  skus: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  units: 'M3 3v18h18M18 17V9m-6 8V5m-6 12v-4',
  valuation: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  low: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
  cartons: 'M4 7h16v10H4zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 13h16',
}

const HEADERS = [
  'Product Name',
  'SKU / Barcode',
  'Price per Piece (RWF)',
  'Carton Price',
  'Pieces per Carton',
  'Cartons',
  'Stock on Hand',
]
const ALIGNMENTS = ['left', 'left', 'right', 'right', 'right', 'right', 'right']

const cartonsOf = (p) => {
  const ppc = Number(p.piecesPerCarton) || 1
  const units = Number(p.quantity) || 0
  return Math.floor(units / ppc)
}

/* Circular product photo — "circled short photo" from the Add Product flow.
   Falls back to the product initial when there is no photo. */
const ProductNameCell = ({ p }) => (
  <div className="flex items-center gap-3 min-w-0">
    <span className="w-9 h-9 rounded-full shrink-0 overflow-hidden border border-line bg-brand-50">
      {p.photo ? (
        <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
      ) : (
        <span className="w-full h-full flex items-center justify-center text-xs font-bold text-brand-700 uppercase">
          {(p.name || '?').charAt(0)}
        </span>
      )}
    </span>
    <span className="text-sm text-ink truncate">{p.name}</span>
  </div>
)

const tableRowOf = (p) => [
  <ProductNameCell key={p.id} p={p} />,
  p.sku,
  formatCurrency(p.unitPrice),
  formatCurrency(p.price),
  commaN(p.piecesPerCarton),
  commaN(cartonsOf(p)),
  commaN(p.quantity),
]

const exportRowOf = (p) => [
  p.name,
  p.sku,
  formatCurrency(p.unitPrice),
  formatCurrency(p.price),
  commaN(p.piecesPerCarton),
  commaN(cartonsOf(p)),
  commaN(p.quantity),
]

const totalsRowOf = (inventory) => [
  'TOTAL',
  '',
  '',
  '',
  '',
  commaN(inventory.reduce((s, p) => s + cartonsOf(p), 0)),
  commaN(inventory.reduce((s, p) => s + (Number(p.quantity) || 0), 0)),
]

const snapshot = () => new Date().toLocaleDateString('en-RW', { dateStyle: 'medium' })

export default createReportPage({
  eyebrow: 'Master Inventory',
  title: 'All Products',
  description: 'Every product in the shop with its piece and carton pricing, pieces per carton, cartons and stock on hand.',
  buildCards: (data, ctx) => {
    const inventory = data?.inventory || []
    return [
      { label: 'Total Products', value: `${commaN(inventory.length)} SKUs`, sub: 'Active catalogue entries', icon: ICONS.skus },
      { label: 'Cartons on Hand', value: `${commaN(inventory.reduce((s, p) => s + cartonsOf(p), 0))} cartons`, sub: 'Full cartons across SKUs', icon: ICONS.cartons, accent: true },
      { label: 'Units in Stock', value: `${commaN(inventory.reduce((x, p) => x + p.quantity, 0))} units`, sub: 'On-hand quantity across SKUs', icon: ICONS.units },
      { label: 'Low Stock Items', value: `${commaN(inventory.filter((p) => p.status !== 'OK').length)} items`, sub: 'At or below reorder level', icon: ICONS.low },
      { label: 'Inventory Snapshot', value: snapshot(), sub: 'As of today', icon: ICONS.snapshot },
    ]
  },
  buildChildren: (data, ctx) => {
    const inventory = data?.inventory || []
    return (
      <div className="space-y-3">
        <SectionHeader
          eyebrow="Line Items"
          title="Master Inventory Detail"
          description="Each product with its photo, piece and carton pricing, pieces per carton, cartons and stock on hand."
        />
        <ReportTable
          headers={HEADERS}
          rows={inventory.map(tableRowOf)}
          alignments={ALIGNMENTS}
          totalsRow={totalsRowOf(inventory)}
          statusCols={[]}
          emptyMessage="No products in the catalogue yet."
        />
      </div>
    )
  },
  buildExport: (data, ctx) => {
    const { periodLabel } = ctx
    const inventory = data?.inventory || []
    const rows = inventory.map(exportRowOf)
    return {
      reportTitle: 'All Products Inventory Report',
      subtitle: 'Every product in the shop — SKU / Barcode, price per piece, carton price, pieces per carton and cartons on hand.',
      headers: HEADERS,
      rows,
      photos: inventory.map((p) => p.photo || null),
      alignments: ALIGNMENTS,
      totalsRow: totalsRowOf(inventory),
      statusCols: [],
      summaryCards: [
        { label: 'Total Products', value: `${commaN(inventory.length)} SKUs` },
        { label: 'Cartons on Hand', value: `${commaN(inventory.reduce((s, p) => s + cartonsOf(p), 0))} cartons` },
        { label: 'Units in Stock', value: `${commaN(inventory.reduce((x, p) => x + p.quantity, 0))} units` },
        { label: 'Inventory Snapshot', value: snapshot() },
      ],
      filename: stamp('All-Products', periodLabel),
    }
  },
})