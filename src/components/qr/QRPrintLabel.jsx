/**
 * QRPrintLabel — printable shelf/barcode label template (product name + QR),
 * sized for standard label stock. Print via the browser or jspdf
 * (utils/exportToPDF.js).
 */
import QRCodeGenerator from './QRCodeGenerator'

export default function QRPrintLabel({ product, size = 120 }) {
  return (
    <div className="inline-block rounded border border-dashed border-line bg-card p-4 text-center">
      <p className="mb-2 text-sm font-semibold text-ink">{product?.name ?? 'Product'}</p>
      <p className="mb-2 text-xs text-muted">{product?.code ?? '—'}</p>
      <QRCodeGenerator product={product} size={size} />
    </div>
  )
}