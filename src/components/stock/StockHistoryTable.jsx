/**
 * StockHistoryTable — audit-friendly movement history.
 * Columns always include: timestamp, product, type (in/out/adjust), quantity,
 * ACTOR (the user who moved it) and note. This is the accountability view for
 * "who moved / removed stock and why".
 */
import Table from '../common/Table'
import Badge from '../common/Badge'

export default function StockHistoryTable({ movements = [], loading = false }) {
  const columns = [
    { key: 'createdAt', label: 'When', render: (r) => r.createdAt ?? '—' }, // TODO: formatDate
    { key: 'productName', label: 'Product' },
    {
      key: 'type',
      label: 'Type',
      render: (r) => {
        const tone = r.type === 'in' ? 'green' : r.type === 'out' ? 'red' : 'amber'
        return <Badge tone={tone}>{r.type}</Badge>
      },
    },
    { key: 'quantity', label: 'Qty' },
    { key: 'actorName', label: 'Done by', render: (r) => r.actorName ?? '—' },
    { key: 'note', label: 'Reason / note' },
  ]
  return <Table columns={columns} rows={movements} loading={loading} emptyText="No movements yet" />
}