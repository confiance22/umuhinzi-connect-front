/**
 * WorkerTable — staff list with role badges, active status and actions
 * (edit / deactivate). OWNER ONLY page component.
 */
import Table from '../common/Table'
import RoleBadge from './RoleBadge'
import Badge from '../common/Badge'

export default function WorkerTable({ workers = [], loading = false, onEdit, onToggle }) {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => <RoleBadge role={r.role} /> },
    { key: 'isActive', label: 'Status', render: (r) => <Badge tone={r.isActive ? 'green' : 'gray'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex justify-end gap-2 text-xs">
          <button onClick={() => onEdit?.(r)} className="text-brand-700 hover:underline">Edit</button>
          <button onClick={() => onToggle?.(r)} className="text-muted hover:underline">
            {r.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ]
  return <Table columns={columns} rows={workers} loading={loading} emptyText="No workers yet" />
}