/**
 * WorkersPage — Shop Manager staff management (mirrors the admin portal design).
 * Search / status filters, worker table with National ID for police traceability,
 * add/edit via AddWorkerModal, and activate/deactivate/delete actions.
 * Worker identity backs the stock audit trail.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Table } from '../../../components/common/Table'
import { RowActionMenu, DockIcons } from '../../../components/admin/RowActions'
import ConfirmDeleteModal from '../../../components/admin/ConfirmDeleteModal'
import AddWorkerModal from '../components/AddWorkerModal'
import { workerApi } from '../../../api/workerApi'
import { useAuth } from '../../../hooks/useAuth'
import { useToastContext } from '../../../context/ToastContext'

const AVATAR_STYLES = [
  'bg-brand-100 text-brand-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-ink/[0.06] text-ink/70',
  'bg-violet-100 text-violet-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-teal-100 text-teal-700',
]
const initialsOf = (name) =>
  (name || '?')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
const avatarStyle = (seed) => {
  let h = 0
  const s = seed || '?'
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return AVATAR_STYLES[h % AVATAR_STYLES.length]
}

const maskNid = (nid = '') => {
  if (nid.length !== 16) return nid ? `…${nid.slice(-4)}` : '—'
  return `${nid.slice(0, 3)}•••• •••• ${nid.slice(-4)}`
}

const STATUS_STYLES = {
  Active: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Inactive: { pill: 'bg-ink/5 text-ink/45', dot: 'bg-ink/30' },
}
const StatusPill = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Inactive
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}
const ROLE_STYLES = {
  shop_manager: { pill: 'bg-brand-50 text-brand-700', label: 'Manager' },
  worker: { pill: 'bg-ink/5 text-ink/45', label: 'Worker' },
}
const RolePill = ({ role }) => {
  const s = ROLE_STYLES[role] || ROLE_STYLES.worker
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${s.pill}`}>
      {s.label}
    </span>
  )
}
const resolveWorkerStatus = (w) => (w.enabled === false ? 'Inactive' : 'Active')

const filterFieldClass =
  'h-11 w-full rounded-lg border border-line bg-page text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors duration-200'

const SearchIcon = (
  <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
  </svg>
)
const RebootIcon = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 105.64-11.36L1 10" />
  </svg>
)

const TRAIL_CARD = (
  <svg className="w-9 h-9 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12l2 2 4-4" />
    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export const WorkersPage = () => {
  const { showToast } = useToastContext()
  const { user } = useAuth()

  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorker, setEditingWorker] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [removalRequests, setRemovalRequests] = useState([])
  const [actingRemovalId, setActingRemovalId] = useState(null)

  const fetchWorkers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await workerApi.list()
      setWorkers(Array.isArray(data) ? data : [])
    } catch (err) {
      showToast(err.message || 'Could not load workers', 'error')
      setError(err.message || 'Could not load workers')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const fetchRemovalRequests = useCallback(async () => {
    try {
      const data = await workerApi.getRemovalRequests()
      setRemovalRequests(Array.isArray(data) ? data : [])
    } catch {
      setRemovalRequests([])
    }
  }, [])

  useEffect(() => {
    fetchWorkers()
    fetchRemovalRequests()
  }, [fetchWorkers, fetchRemovalRequests])

  const pendingApprovals = useMemo(
    () => removalRequests.filter((r) => r.status === 'pending' && r.targetId === user?.id),
    [removalRequests, user]
  )

  const handleApproval = async (request, approve) => {
    setActingRemovalId(request.id)
    try {
      const res = approve
        ? await workerApi.approveRemovalRequest(request.id)
        : await workerApi.rejectRemovalRequest(request.id)
      showToast(res?.message || (approve ? 'Request approved' : 'Request declined'), 'success')
      await Promise.all([fetchRemovalRequests(), fetchWorkers()])
    } catch (err) {
      showToast(err.message || 'Could not process the request', 'error')
    } finally {
      setActingRemovalId(null)
    }
  }

  const filteredWorkers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return workers.filter((w) => {
      if (q) {
        const hit =
          (w.name || '').toLowerCase().includes(q) ||
          (w.username || '').toLowerCase().includes(q) ||
          (w.email || '').toLowerCase().includes(q) ||
          (w.nationalId || '').includes(q) ||
          (w.role === 'shop_manager' ? 'manager' : 'worker').includes(q)
        if (!hit) return false
      }
      if (filterStatus !== 'All' && resolveWorkerStatus(w) !== filterStatus) return false
      return true
    })
  }, [workers, search, filterStatus])

  const resetFilters = () => {
    setSearch('')
    setFilterStatus('All')
  }

  const handleSaveWorker = async (workerData) => {
    const payload = {
      shopId: user?.shopId || 1,
      name: workerData.name,
      nationalId: workerData.nationalId,
      username: workerData.username,
      email: workerData.email,
      phone: workerData.phone,
    }
    const isManager = workerData.role === 'shop_manager'
    try {
      if (editingWorker) {
        await workerApi.update(editingWorker.id, {
          ...payload,
          enabled: workerData.status !== 'Inactive',
          ...(workerData.pin ? { pin: workerData.pin } : {}),
        })
        showToast('Team member updated', 'success')
      } else {
        const createPayload = { ...payload, pin: workerData.pin, role: isManager ? 'shop_manager' : 'worker' }
        if (isManager && workerData.password) createPayload.password = workerData.password
        await workerApi.create(createPayload)
        showToast(
          isManager
            ? 'Manager added — they sign in with the password you set and a code sent to their email.'
            : `Worker added — PIN: ${workerData.pin} (share it once, they'll memorise it)`,
          'success',
          10000
        )
      }
      await fetchWorkers()
      setIsModalOpen(false)
      setEditingWorker(null)
    } catch (err) {
      showToast(err.message || 'Could not save team member', 'error')
    }
  }

  const handleToggleStatus = async (worker) => {
    try {
      const res = await workerApi.setStatus(worker.id, worker.enabled === false)
      await fetchWorkers()
      if (res?.approvalRequired) {
        showToast(res.message || 'Deactivating a co-manager requires their approval. A request was sent to them.', 'success', 8000)
      } else {
        showToast('Member status updated', 'success')
      }
    } catch (err) {
      showToast(err.message || 'Could not update status', 'error')
    }
  }

  const [togglingStockInId, setTogglingStockInId] = useState(null)

  const handleToggleStockIn = async (worker, enabled) => {
    setTogglingStockInId(worker.id)
    try {
      await workerApi.setStockIn(worker.id, enabled)
      showToast(`${worker.name} ${enabled ? 'can now receive stock' : 'can no longer receive stock'}`, 'success')
      await fetchWorkers()
    } catch (err) {
      showToast(err.message || 'Could not update stock-in access', 'error')
    } finally {
      setTogglingStockInId(null)
    }
  }

  const StockInSwitch = ({ worker }) => {
    const on = Boolean(worker.stockInEnabled)
    const isManagerRow = worker.role === 'shop_manager'
    if (isManagerRow) {
      return (
        <span className="text-xs font-medium text-brand-700 bg-brand-50 rounded-full px-2.5 py-1 uppercase tracking-wide">Always</span>
      )
    }
    const busy = togglingStockInId === worker.id
    return (
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={busy || !worker.enabled}
        onClick={() => handleToggleStockIn(worker, !on)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline focus:outline-2 focus:outline-brand-500/40 disabled:opacity-50 disabled:pointer-events-none ${
          on ? 'bg-brand-600' : 'bg-ink/15'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-page shadow transition-transform duration-200 ${
            on ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    )
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await workerApi.remove(deleteTarget.id)
      await fetchWorkers()
      if (res?.approvalRequired) {
        showToast(res.message || 'Removing a co-manager requires their approval. A request was sent to them.', 'success', 8000)
      } else {
        showToast('Member removed', 'success')
      }
      setDeleteTarget(null)
    } catch (err) {
      showToast(err.message || 'Could not remove member', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortValue: (w) => w.name || w.username || '',
      render: (w) => {
        const label = w.name || w.username || '?'
        return (
          <div className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${avatarStyle(label)}`}>
              {initialsOf(label)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink whitespace-nowrap">{w.name || '—'}</p>
              <p className="text-xs text-gray-400">{w.username || ''}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'nationalId',
      header: 'National ID',
      sortable: true,
      sortValue: (w) => w.nationalId || '',
      render: (w) => (
        <span title={w.nationalId || ''} className="text-sm text-ink/70 font-medium tabular-nums">
          {maskNid(w.nationalId || '')}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      sortValue: (w) => (w.role === 'shop_manager' ? 'Manager' : 'Worker'),
      render: (w) => <RolePill role={w.role} />,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      sortValue: (w) => w.email || '',
      render: (w) => <span className="text-ink/45 text-sm">{w.email || '—'}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      sortValue: (w) => w.phone || '',
      render: (w) => <span className="text-sm text-ink/60 tabular-nums">{w.phone || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: resolveWorkerStatus,
      render: (w) => <StatusPill status={resolveWorkerStatus(w)} />,
    },
    {
      key: 'stockIn',
      header: 'Stock-In Access',
      sortable: true,
      sortValue: (w) => (w.role === 'shop_manager' ? 2 : w.stockInEnabled ? 1 : 0),
      render: (w) => <StockInSwitch worker={w} />,
    },
    {
      key: 'createdAt',
      header: 'Added',
      sortable: true,
      sortValue: (w) => (w.createdAt ? new Date(w.createdAt).getTime() : 0),
      render: (w) => <span className="text-gray-400 text-sm">{w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '132px',
      render: (w) => (
        <div className="flex justify-end">
          <RowActionMenu
            primary={{ label: 'Edit', icon: DockIcons.edit, onClick: () => { setEditingWorker(w); setIsModalOpen(true) } }}
            items={[
              w.enabled === false
                ? { label: 'Activate member', icon: DockIcons.power, iconTone: 'text-emerald-500', onClick: () => handleToggleStatus(w) }
                : { label: 'Deactivate member', icon: DockIcons.power, onClick: () => handleToggleStatus(w) },
              'divider',
              { label: 'Remove member', icon: DockIcons.trash, danger: true, onClick: () => setDeleteTarget(w) },
            ]}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-brand-600">TEAM</span>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-1">Team Members</h1>
          <p className="text-sm text-muted mt-1">Manage workers and co-managers. Every stock movement is traced to a person.</p>
        </div>
        <button
          onClick={() => {
            setEditingWorker(null)
            setIsModalOpen(true)
          }}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
        >
          New Team Member
        </button>
      </div>

      {pendingApprovals.map((r) => (
        <div key={r.id} className="rounded-2xl border border-amber-300/40 bg-amber-50/80 px-5 py-4 animate-[fadeIn_0.3s_ease]">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-amber-900">Action needed on your account</p>
              <p className="text-sm text-amber-800 leading-relaxed mt-1">
                <span className="font-semibold">{r.requesterName || 'A co-manager'}</span> has requested to{' '}
                <span className="font-semibold">{r.action === 'delete' ? 'remove your account' : 'deactivate your account'}</span>.
                This only happens if <span className="font-semibold">you approve</span>. The request expires{' '}
                {r.expiresAt ? new Date(r.expiresAt).toLocaleString() : 'soon'}.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleApproval(r, false)}
                disabled={actingRemovalId === r.id}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-amber-900 border border-amber-300 hover:bg-amber-100 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
              >
                Decline
              </button>
              <button
                onClick={() => handleApproval(r, true)}
                disabled={actingRemovalId === r.id}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
              >
                {actingRemovalId === r.id ? 'Processing…' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-card rounded-2xl border border-line shadow-soft px-4 py-3.5 flex flex-wrap items-end gap-x-3 gap-y-2.5">
        <div className="w-[280px] flex flex-col gap-1">
          <label className="text-sm font-medium text-ink">Search</label>
          <div className="relative">
            {SearchIcon}
            <input
              type="text"
              placeholder="Name, email or National ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${filterFieldClass} pl-10`}
            />
          </div>
        </div>
        <div className="w-[150px] flex flex-col gap-1">
          <label className="text-sm font-medium text-ink">Status</label>
          <select className={`${filterFieldClass} cursor-pointer`} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="flex-1" />
        <button
          onClick={resetFilters}
          className="inline-flex items-center justify-center gap-1.5 text-ink text-sm font-medium px-4 py-2.5 rounded-full border border-line bg-page hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
        >
          {RebootIcon}
          Reset
        </button>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 flex items-start gap-3">
        {TRAIL_CARD}
        <p className="text-sm text-brand-900 leading-relaxed pt-1">
          <span className="font-bold">Traceability:</span> National IDs are kept on record so the police can identify anyone
          who handled stock, pursues a theft, or goes missing. Keep them up to date when editing a member.
        </p>
      </div>

      <Table
        columns={columns}
        rows={filteredWorkers}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={1160}
        skeletonRows={8}
        pageSize={10}
        rowLabel="team members"
        emptyTitle={workers.length === 0 ? 'No team members yet' : 'No matches'}
        emptyMessage={workers.length === 0 ? 'Add your first worker or co-manager to start recording who handles stock.' : 'No team members match the current filters.'}
      />

      {isModalOpen && (
        <AddWorkerModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingWorker(null)
          }}
          onSubmit={handleSaveWorker}
          editingWorker={editingWorker}
        />
      )}

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title={deleteTarget?.role === 'shop_manager' ? 'Request removal' : 'Remove member'}
        message={
          deleteTarget?.role === 'shop_manager'
            ? 'Removing a co-manager requires their approval. A request to remove'
            : 'Are you sure you want to remove'
        }
        itemName={deleteTarget?.name || deleteTarget?.username || ''}
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default WorkersPage
