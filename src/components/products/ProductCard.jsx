/**
 * ProductCard — card view of a product (name, code, price, stock level,
 * low-stock badge, QR action). Used on the dashboard and product grids.
 */
import Badge from '../common/Badge'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ProductCard({ product, onGenerateQr }) {
  const lowStock = Boolean(product && product.quantity !== null && product.reorderLevel !== null && product.quantity <= product.reorderLevel)
  return (
    <div className="rounded-2xl border border-line bg-card shadow-soft p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{product?.name ?? 'Product'}</h3>
        {lowStock && <Badge tone="red">Low stock</Badge>}
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
        <span>{product?.code ?? '—'}</span>
        {product?.price != null && (
          <span className="font-semibold text-ink">{formatCurrency(product.price)}</span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted">
          Qty: <span className="font-semibold">{product?.quantity ?? 0}</span>
        </span>
        {onGenerateQr && (
          <button className="text-brand-700 hover:underline" onClick={() => onGenerateQr(product)}>
            QR label
          </button>
        )}
      </div>
    </div>
  )
}