/**
 * ShopsPage — Registered shops directory (Super Admin). Shops become active
 * the moment they are created (no approval flow); the only status action is
 * toggling a shop active/suspended. Super Admins can also create shops directly.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Table } from '../../../components/common/Table'
import { RowActionMenu, DockIcons } from '../../../components/admin/RowActions'
import ConfirmModal from '../../../components/admin/ConfirmModal'
import { shopsApi } from '../../../api/shopsApi'
import { useToastContext } from '../../../context/ToastContext'

const filterFieldClass =
  'h-11 w-full text-sm px-3.5 rounded-lg border border-line bg-white text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all duration-200'

const ApprovalPill = ({ status, active }) => {
  if (status !== 'APPROVED') {
    const labels = {
      PENDING: { text: 'Awaiting approval', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
      REJECTED: { text: 'Rejected', cls: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
    }
    const cfg = labels[status] || { text: status || 'Unknown', cls: 'bg-page text-muted', dot: 'bg-muted' }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.text}
      </span>
    )
  }
return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-page text-muted'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-muted'}`} />
      {active ? 'Active' : 'Suspended'}
    </span>
  )
}

const inputClass =
  'h-11 w-full rounded-lg border border-line bg-white text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all'

const RebootIcon = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 105.64-11.36L1 10" />
  </svg>
)

const SearchIcon = (
  <svg className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
  </svg>
)

export const ShopsPage = () => {
  const { showToast } = useToastContext()
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', address: '', contactPersonEmail: '', contactPersonPhone: '', website: '' })
  const [submitting, setSubmitting] = useState(false)

  const [approveTarget, setApproveTarget] = useState(null)
  const [approving, setApproving] = useState(false)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  const [statusTarget, setStatusTarget] = useState(null)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (!submitting && showCreate) setShowCreate(false)
      if (!approving && approveTarget) setApproveTarget(null)
      if (!rejecting && rejectTarget) setRejectTarget(null)
      if (!toggling && statusTarget) setStatusTarget(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [submitting, showCreate, approving, approveTarget, rejecting, rejectTarget, toggling, statusTarget])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await shopsApi.getShops()
      setShops(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.message)
      setShops([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return shops.filter((s) => {
      const status = s.approvalStatus || (s.active ? 'APPROVED' : 'PENDING')
      if (statusFilter === 'ACTIVE' && (!(status === 'APPROVED' && s.active))) return false
      if (statusFilter === 'SUSPENDED' && !(status === 'APPROVED' && !s.active)) return false
      if (statusFilter === 'PENDING' && status !== 'PENDING') return false
      if (statusFilter === 'APPROVED' && status !== 'APPROVED') return false
      if (statusFilter === 'REJECTED' && status !== 'REJECTED') return false
      if (!q) return true
      return (
        (s.name || '').toLowerCase().includes(q) ||
        (s.code || '').toLowerCase().includes(q) ||
        (s.contactPersonEmail || '').toLowerCase().includes(q)
      )
    })
  }, [shops, search, statusFilter])

  const pendingCount = shops.filter((s) => (s.approvalStatus || (s.active ? 'APPROVED' : 'PENDING')) === 'PENDING').length

  const toggleStatus = (shop) => setStatusTarget(shop)

  const confirmToggleStatus = async () => {
    if (!statusTarget) return
    const next = !statusTarget.active
    setToggling(true)
    try {
      await shopsApi.setShopStatus(statusTarget.id, next)
      showToast(`Shop ${next ? 'activated' : 'suspended'}`, 'success')
      setStatusTarget(null)
      await load()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setToggling(false)
    }
  }

  const executeCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await shopsApi.createShop(form)
      showToast('Shop created successfully', 'success')
      setShowCreate(false)
      setForm({ name: '', code: '', address: '', contactPersonEmail: '', contactPersonPhone: '', website: '' })
      await load()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmApprove = async () => {
    if (!approveTarget) return
    setApproving(true)
    try {
      await shopsApi.approveShop(approveTarget.id)
      showToast(`"${approveTarget.name}" approved — its manager can sign in now`, 'success', 6000)
      setApproveTarget(null)
      await load()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setApproving(false)
    }
  }

  const confirmReject = async (e) => {
    e.preventDefault()
    if (!rejectTarget) return
    setRejecting(true)
    try {
      await shopsApi.rejectShop(rejectTarget.id, rejectReason.trim())
      showToast(`"${rejectTarget.name}" rejected`, 'success')
      setRejectTarget(null)
      setRejectReason('')
      await load()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setRejecting(false)
    }
  }

  const renderApprovalActions = (e) => {
    if (e.approvalStatus === 'PENDING') {
      return (
        <RowActionMenu
          primary={{
            label: 'Approve',
            icon: DockIcons.check,
            iconTone: 'text-emerald-500',
            onClick: () => setApproveTarget(e),
          }}
          items={[
            { label: 'Reject', icon: DockIcons.x, iconTone: 'text-rose-500', onClick: () => { setRejectTarget(e); setRejectReason('') } },
          ]}
        />
      )
    }
    if (e.approvalStatus === 'REJECTED') {
      return (
        <RowActionMenu
          primary={{
            label: 'Approve',
            icon: DockIcons.check,
            iconTone: 'text-emerald-500',
            onClick: () => setApproveTarget(e),
          }}
          items={[
            { label: 'Reject again', icon: DockIcons.x, iconTone: 'text-rose-500', onClick: () => { setRejectTarget(e); setRejectReason('') } },
          ]}
        />
      )
    }
    return (
      <RowActionMenu
        primary={
          e.active
            ? { label: 'Suspend', icon: DockIcons.power, onClick: () => toggleStatus(e) }
            : { label: 'Activate', icon: DockIcons.power, iconTone: 'text-emerald-500', onClick: () => toggleStatus(e) }
        }
      />
    )
  }

  const columns = [
    {
      key: 'name',
      header: 'Shop',
      sortable: true,
      sortValue: (e) => e.name || '',
      render: (e) => (
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-full bg-brand-600 text-white text-[13px] font-semibold flex items-center justify-center shrink-0">
            {(e.name || '?').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-ink truncate max-w-[240px]">{e.name}</p>
            <p className="text-xs text-gray-400 font-mono truncate">{e.code || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Location',
      sortable: true,
      sortValue: (e) => e.address || '',
      render: (e) => <span className="text-sm text-ink">{e.address || '—'}</span>,
    },
    {
      key: 'contact',
      header: 'Contact',
      sortable: false,
      render: (e) => (
        <div className="min-w-0">
          <p className="text-sm text-ink truncate max-w-[220px]">{e.contactPersonEmail || '—'}</p>
          <p className="text-xs text-gray-400 truncate">{e.contactPersonPhone || '—'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (e) => {
        if (e.approvalStatus === 'PENDING') return 0
        if (e.approvalStatus === 'REJECTED') return 1
        return e.active ? 3 : 2
      },
      render: (e) => <ApprovalPill status={e.approvalStatus} active={e.active} />,
    },
    {
      key: 'createdAt',
      header: 'Registered',
      sortable: true,
      sortValue: (e) => (e.createdAt ? new Date(e.createdAt).getTime() : 0),
      render: (e) => <span className="text-gray-400">{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'N/A'}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '140px',
      render: (e) => (
        <div className="flex justify-end">
          {renderApprovalActions(e)}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-brand-600">Shop Directory</span>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-1">Registered Shops</h1>
          <p className="text-sm text-muted mt-1">
            Every shop on the platform{shops.length ? ` — ${shops.length} total` : ''}. Self-registered shops start
            awaiting approval — approve them to activate sign-in for their manager.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
        >
          New Shop
        </button>
      </div>

      {pendingCount > 0 && (
        <button
          type="button"
          onClick={() => setStatusFilter('PENDING')}
          className="w-full flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition-colors hover:bg-amber-100"
        >
          <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
          <span className="text-sm font-medium text-amber-800">
            {pendingCount} shop{pendingCount > 1 ? 's' : ''} awaiting approval — click to review
          </span>
          <svg className="w-4 h-4 text-amber-700 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      <div className="rounded-2xl border border-line bg-card shadow-soft px-4 py-3.5 flex flex-wrap items-end gap-x-3 gap-y-2.5">
        <div className="w-[260px] flex flex-col gap-1">
          <label className="text-sm font-medium text-ink">Search</label>
          <div className="relative">
            {SearchIcon}
            <input type="text" placeholder="Name, code or email…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${filterFieldClass} pl-10`} />
          </div>
        </div>

        <div className="w-[140px] flex flex-col gap-1">
          <label className="text-sm font-medium text-ink">Status</label>
          <select className={`${filterFieldClass} cursor-pointer`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="PENDING">Awaiting approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div className="flex-1" />
        <button
          type="button"
          onClick={() => {
            setSearch('')
            setStatusFilter('ALL')
          }}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full bg-white text-ink border border-line hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
        >
          {RebootIcon}
          Reset
        </button>
      </div>

      <Table
        columns={columns}
        rows={visible}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={860}
        skeletonRows={10}
        pageSize={10}
        rowLabel="shops"
        emptyTitle={shops.length === 0 ? 'No shops yet' : 'No matches'}
        emptyMessage={
          shops.length === 0
            ? 'Shops appear here as they register on the platform.'
            : 'No shops match the current filters.'
        }
      />

      {showCreate &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setShowCreate(false)} />
            <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto animate-[zoomIn_0.2s_ease]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold tracking-tight text-ink">New Shop</h2>
                <button onClick={() => !submitting && setShowCreate(false)} className="w-8 h-8 rounded-full hover:bg-page text-gray-400 hover:text-ink flex items-center justify-center transition-colors" aria-label="Close">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
              <form onSubmit={executeCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-ink">Shop Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="e.g. Kimironko Tech Hub" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-ink">Shop Code</label>
                    <input type="text" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} className={inputClass} placeholder="e.g. KIM-001" required />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-ink">Address</label>
                  <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className={inputClass} placeholder="Street, district, city" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-ink">Contact Person Email</label>
                    <input type="email" value={form.contactPersonEmail} onChange={(e) => setForm((p) => ({ ...p, contactPersonEmail: e.target.value }))} className={inputClass} placeholder="manager@shop.rw" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-ink">Contact Person Phone</label>
                    <input type="text" value={form.contactPersonPhone} onChange={(e) => setForm((p) => ({ ...p, contactPersonPhone: e.target.value }))} className={inputClass} placeholder="+250 7xx xxx xxx" required />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-ink">Website (optional)</label>
                  <input type="text" value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} className={inputClass} placeholder="https://shop.rw" />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} disabled={submitting} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white text-ink border border-line text-sm font-medium hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                    {submitting ? 'Creating…' : 'Create Shop'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {approveTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !approving && setApproveTarget(null)} />
            <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[zoomIn_0.2s_ease]">
              <div className="flex items-start justify-between mb-4">
                <span className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4 12 14.01l-3-3" />
                  </svg>
                </span>
                <button onClick={() => !approving && setApproveTarget(null)} className="w-8 h-8 rounded-full hover:bg-page text-gray-400 hover:text-ink flex items-center justify-center transition-colors" aria-label="Close">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">Approve shop</h2>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                Approve <span className="font-semibold text-ink">{approveTarget.name}</span>? It becomes active and
                <span className="font-semibold text-ink"> {approveTarget.contactPersonEmail}</span> can sign in immediately.
              </p>
              <div className="mt-4 rounded-xl bg-page border border-line px-4 py-3 text-xs text-muted space-y-1">
                <p><span className="font-semibold text-ink">Code · </span>{approveTarget.code || '—'}</p>
                <p><span className="font-semibold text-ink">Registered · </span>{approveTarget.createdAt ? new Date(approveTarget.createdAt).toLocaleDateString() : '—'}</p>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button type="button" onClick={() => setApproveTarget(null)} disabled={approving} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white text-ink border border-line text-sm font-medium hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                  Cancel
                </button>
                <button type="button" onClick={confirmApprove} disabled={approving} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#16A34A] text-white text-sm font-medium hover:bg-[#128A3E] transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                  {approving ? 'Approving…' : 'Approve Shop'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {rejectTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !rejecting && setRejectTarget(null)} />
            <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[zoomIn_0.2s_ease]">
              <div className="flex items-start justify-between mb-4">
                <span className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </span>
                <button onClick={() => !rejecting && setRejectTarget(null)} className="w-8 h-8 rounded-full hover:bg-page text-gray-400 hover:text-ink flex items-center justify-center transition-colors" aria-label="Close">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">Reject shop</h2>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                Reject <span className="font-semibold text-ink">{rejectTarget.name}</span>? Its manager won't be able to sign in.
              </p>
              <form onSubmit={confirmReject} className="mt-4 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Reason (shown to the manager, optional)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Incomplete business documents"
                  className={`${inputClass} h-auto py-2.5 resize-none`}
                />
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setRejectTarget(null)} disabled={rejecting} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white text-ink border border-line text-sm font-medium hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                    Cancel
                  </button>
                  <button type="submit" disabled={rejecting} className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                    {rejecting ? 'Rejecting…' : 'Reject Shop'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      <ConfirmModal
        open={Boolean(statusTarget)}
        title={statusTarget && !statusTarget.active ? 'Activate shop?' : 'Suspend shop?'}
        message={
          statusTarget &&
          (statusTarget.active ? (
            <>Suspend <span className="font-semibold text-ink">{statusTarget.name}</span>? It will no longer be able to sign in until you reactivate it.</>
          ) : (
            <>Make <span className="font-semibold text-ink">{statusTarget.name}</span> active? Its manager will be able to sign in immediately.</>
          ))
        }
        icon={DockIcons.power}
        iconChip={statusTarget?.active ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}
        tone={statusTarget?.active ? 'amber' : 'green'}
        confirmLabel={statusTarget?.active ? 'Suspend' : 'Activate'}
        onCancel={() => setStatusTarget(null)}
        onConfirm={confirmToggleStatus}
        loading={toggling}
      />
    </div>
  )
}

export default ShopsPage
