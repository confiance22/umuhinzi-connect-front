/**
 * PermissionsPage — read-only catalog of every Umuhinzi Connect privilege.
 * Search / category / status filters + sortable DataTable.
 */
import React, { useState, useEffect, useMemo } from 'react'
import { Table } from '../../../components/common/Table'
import { adminApi } from '../../../api/adminApi'
import { useToastContext } from '../../../context/ToastContext'

const filterFieldClass =
  'h-11 w-full text-sm px-3.5 rounded-lg border border-line bg-[#fbf7ec] text-ink placeholder:text-muted/55 focus:border-[#84cc16] focus:outline focus:outline-2 focus:outline-[#84cc16]/25 transition-all duration-200'

const columns = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    sortValue: (p) => p.name || '',
    render: (p) => (
      <code className="text-sm font-semibold font-mono text-ink">{p.name}</code>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    sortable: true,
    sortValue: (p) => p.description || '',
    render: (p) => <span className="text-sm text-gray-500 max-w-sm block">{p.description || '—'}</span>,
  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    sortValue: (p) => p.category || '',
    render: (p) => (
      <span className="px-2.5 py-1 bg-[#d9f99d]/20 text-[#3f6212] rounded-full text-xs font-semibold">
        {p.category || 'General'}
      </span>
    ),
  },
  {
    key: 'active',
    header: 'Status',
    sortable: true,
    sortValue: (p) => (p.active ? 'Active' : 'Inactive'),
    render: (p) => (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
          p.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-page text-muted border border-line'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        {p.active ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Created At',
    sortable: true,
    sortValue: (p) => (p.createdAt ? new Date(p.createdAt).getTime() : 0),
    render: (p) => <span className="text-gray-400">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</span>,
  },
]

const SearchIcon = (
  <svg className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

export const PermissionsPage = () => {
  const [permissions, setPermissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useToastContext()

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await adminApi.getPermissions()
        if (!cancelled) setPermissions(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load permissions')
          showToast(err.message || 'Failed to load permissions', 'error')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [showToast])

  const categories = useMemo(() => [...new Set(permissions.map((p) => p.category).filter(Boolean))], [permissions])

  const filteredPermissions = useMemo(
    () =>
      permissions.filter((p) => {
        if (search.trim()) {
          const q = search.trim().toLowerCase()
          const hit = (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
          if (!hit) return false
        }
        if (filterCategory !== 'All' && p.category !== filterCategory) return false
        if (filterStatus !== 'All') {
          const active = filterStatus === 'Active'
          if (p.active !== active) return false
        }
        return true
      }),
    [permissions, search, filterCategory, filterStatus]
  )

  const resetFilters = () => {
    setSearch('')
    setFilterCategory('All')
    setFilterStatus('All')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#4d7c0f]">ACCESS CONTROL</span>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-1">Permissions</h1>
          <p className="text-sm text-muted mt-1">Fine-grained privileges granted to farmer and buyer roles.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-[#efe7d6] shadow-soft px-4 py-3.5 flex flex-wrap items-end gap-x-3 gap-y-2.5">
        <div className="w-[260px] flex flex-col gap-1">
          <label className="text-sm font-medium text-ink">Search</label>
          <div className="relative">
            {SearchIcon}
            <input type="text" placeholder="Name or description..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${filterFieldClass} pl-10`} />
          </div>
        </div>
        <div className="w-[140px] flex flex-col gap-1">
          <label className="text-sm font-medium text-ink">Category</label>
          <select className={`${filterFieldClass} cursor-pointer`} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="All">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="w-[140px] flex flex-col gap-1">
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
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full bg-[#fbf7ec] text-ink border border-line hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
        >
          {RebootIcon}
          Reset
        </button>
      </div>

      <Table
        columns={columns}
        rows={filteredPermissions}
        loading={isLoading}
        error={error}
        minWidth={780}
        skeletonRows={10}
        pageSize={10}
        rowLabel="permissions"
        emptyTitle="No permissions yet"
        emptyMessage="Permissions will appear here once configured on the server."
      />
    </div>
  )
}

export default PermissionsPage
