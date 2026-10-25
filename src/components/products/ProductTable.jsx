/**
 * ProductTable — table of products (name, code, category, price, stock,
 * low-stock badge, actions). Built on components/common/Table. Action
 * visibility (edit/delete) gated by role via usePermissions.
 */
import Table from '../common/Table'
import Badge from '../common/Badge'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ProductTable({ products = [], loading = false, onView, onEdit, onDelete, onGenerateQr }) {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price) },
    {
      key: 'quantity',
      label: 'Stock',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.quantity}
          {row.quantity <= row.reorderLevel && <Badge tone="red">Low</Badge>}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex justify-end gap-2 text-xs">
          <button onClick={() => onView?.(row)} className="text-brand-700 hover:underline">View</button>
          <button onClick={() => onEdit?.(row)} className="text-gray-600 hover:underline">Edit</button>
          {/* delete button rendered only when onDelete provided (owner gate in caller) */}
          {onDelete && <button onClick={() => onDelete(row)} className="text-danger-600 hover:underline">Delete</button>}
        </div>
      ),
    },
  ]
  return <Table columns={columns} rows={products} loading={loading} emptyText="No products found" />
}