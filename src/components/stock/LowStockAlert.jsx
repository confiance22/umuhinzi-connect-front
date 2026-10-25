/**
 * LowStockAlert — highlights products at or below their reorder level.
 * Shown on the dashboard and product list; clicking an item opens the product.
 */
import Badge from '../common/Badge'

export default function LowStockAlert({ items = [], onOpen }) {
  if (!items.length) {
    return <p className="text-sm text-green-700">All stocked up.</p>
  }
  return (
    <ul className="divide-y divide-gray-100 text-sm">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between py-2">
          <button className="text-ink hover:underline" onClick={() => onOpen?.(item)}>
            {item.name}
          </button>
          <Badge tone="red">
            {item.quantity} / reorder {item.reorderLevel}
          </Badge>
        </li>
      ))}
    </ul>
  )
}