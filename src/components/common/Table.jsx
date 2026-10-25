/**
 * Table — generic data table, ported from the Soma Connect admin DataTable.
 *
 * Props: columns [{ key, label|header, align, width, sortable, sortValue,
 * render, headerClass, cellClass }], rows, keyField, loading, error,
 * emptyTitle, emptyMessage, minWidth, title, subtitle, toolbar, footer,
 * stickyHeader, skeletonRows, showRowCount, pageSize (0 = no pagination),
 * rowLabel, dense, filters [], className.
 *
 * Backward compatible: existing calls pass columns with { key, label, render },
 * rows, loading, emptyText → those map to the table body + empty state.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react'

const alignClass = (a) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left')

const pageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out = [1]
  if (current > 3) out.push('…')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) out.push(i)
  if (current < total - 2) out.push('…')
  out.push(total)
  return out
}

const compare = (a, b) => {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

const humanizeValue = (v) =>
  String(v).replace(/[_-]+/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

const SortIcon = ({ state }) => (
  <span className="inline-flex flex-col -space-y-[3px] leading-none">
    <svg className={`w-2.5 h-2.5 ${state === 'asc' ? 'text-ink' : 'text-muted'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l5 6H7z" /></svg>
    <svg className={`w-2.5 h-2.5 ${state === 'desc' ? 'text-ink' : 'text-muted'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-5-6h10z" /></svg>
  </span>
)

const EmptyState = ({ activeCount, onClearFilters, emptyTitle, emptyMessage }) => (
  <div className="flex flex-col items-center text-center max-w-sm mx-auto">
    <span className="w-12 h-12 rounded-2xl bg-page text-muted flex items-center justify-center mb-3">
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 10h18M9 4v16" strokeLinecap="round" />
      </svg>
    </span>
    <p className="text-sm font-medium text-ink">{activeCount > 0 ? 'No matches for these filters' : emptyTitle}</p>
    <p className="text-xs text-muted mt-1.5 leading-relaxed">
      {activeCount > 0 ? 'Loosen or reset the active filters to see more records.' : emptyMessage}
    </p>
    {activeCount > 0 && onClearFilters && (
      <button type="button" onClick={onClearFilters} className="mt-3 text-xs font-medium text-brand-700 hover:text-brand-800">
        Clear filters
      </button>
    )}
  </div>
)

export const Table = ({
  columns = [],
  rows = [],
  keyField = 'id',
  loading = false,
  error = '',
  emptyText = 'No records found.',
  emptyTitle = 'Nothing here yet',
  emptyMessage = 'No records found.',
  minWidth = 960,
  title,
  subtitle,
  toolbar,
  footer,
  stickyHeader = true,
  stickyMaxHeight = 'max-h-[520px]',
  skeletonRows = 8,
  showRowCount = true,
  pageSize = 0,
  rowLabel = 'records',
  dense = false,
  filters = [],
  className = '',
}) => {
  const cellPad = dense ? 'px-3.5 py-2' : 'px-5 py-3'
  const headPad = dense ? 'px-3.5 py-2' : 'px-5 py-3'

  // Accept both { header } and legacy { label } column shapes.
  const normalizedColumns = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        header: column.header ?? column.label ?? humanizeValue(column.key),
      })),
    [columns]
  )

  const orderedColumns = useMemo(() => {
    const actionColumns = []
    const nonActionColumns = []
    normalizedColumns.forEach((column) => {
      if (String(column.key || '').toLowerCase() === 'actions') actionColumns.push(column)
      else nonActionColumns.push(column)
    })
    return [...actionColumns, ...nonActionColumns]
  }, [normalizedColumns])

  const isActionKey = (key) => String(key || '').toLowerCase() === 'actions'
  const dataCols = orderedColumns.filter((c) => !isActionKey(c.key))
  const actionCols = orderedColumns.filter((c) => isActionKey(c.key))
  const primaryCol = dataCols[0]
  const restCols = dataCols.slice(1)
  const renderCell = (column, row) =>
    column.render ? column.render(row) : row[column.key] ?? '—'

  const hasFilters = Array.isArray(filters) && filters.length > 0
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterSel, setFilterSel] = useState({})

  const normFilters = useMemo(() => {
    if (!hasFilters) return []
    return filters.map((f) => {
      const getValue = f.getValue || ((row) => row[f.key])
      let options = f.options
      if (!options || options.length === 0) {
        const seen = new Map()
        rows.forEach((row) => {
          const v = getValue(row)
          if (v === null || v === undefined || v === '') return
          const s = String(v)
          if (!seen.has(s)) seen.set(s, { value: s, label: humanizeValue(s) })
        })
        options = [...seen.values()].sort((a, b) => a.label.localeCompare(b.label)).slice(0, 12)
      } else {
        options = options.map((o) =>
          typeof o === 'object' ? { ...o, value: String(o.value) } : { value: String(o), label: humanizeValue(o) }
        )
      }
      return { key: f.key, label: f.label || humanizeValue(f.key), getValue, options }
    })
  }, [filters, rows, hasFilters])

  const setFilterValue = (key, value) =>
    setFilterSel((prev) => {
      if (!value) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: new Set([value]) }
    })
  const clearFilters = () => setFilterSel({})
  const activeCount = useMemo(
    () => Object.values(filterSel).reduce((n, s) => n + (s?.size || 0), 0),
    [filterSel]
  )

  const filteredRows = useMemo(() => {
    if (!hasFilters || activeCount === 0) return rows
    return rows.filter((row) =>
      normFilters.every((f) => {
        const sel = filterSel[f.key]
        if (!sel || sel.size === 0) return true
        return sel.has(String(f.getValue(row)))
      })
    )
  }, [rows, normFilters, filterSel, hasFilters, activeCount])

  const [sort, setSort] = useState({ key: null, dir: null })
  const toggleSort = (col) => {
    if (!col.sortable) return
    setSort((s) =>
      s.key !== col.key ? { key: col.key, dir: 'asc' } : s.dir === 'asc' ? { key: col.key, dir: 'desc' } : { key: null, dir: null }
    )
  }
  const sortedRows = useMemo(() => {
    if (!sort.key) return filteredRows
    const col = orderedColumns.find((c) => c.key === sort.key)
    if (!col) return filteredRows
    const getVal = col.sortValue || ((r) => r[col.key])
    const arr = [...filteredRows].sort((a, b) => compare(getVal(a), getVal(b)))
    return sort.dir === 'desc' ? arr.reverse() : arr
  }, [filteredRows, sort, orderedColumns])

  const paginate = pageSize > 0
  const total = sortedRows.length
  const totalPages = paginate ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const [page, setPage] = useState(1)
  const current = Math.min(Math.max(1, page), totalPages)
  useEffect(() => {
    setPage(1)
  }, [total, sort])
  const go = (p) => setPage(Math.min(Math.max(1, p), totalPages))

  const startIdx = paginate ? (current - 1) * pageSize : 0
  const visibleRows = paginate ? sortedRows.slice(startIdx, startIdx + pageSize) : sortedRows
  const showingFrom = total === 0 ? 0 : startIdx + 1
  const showingTo = paginate ? Math.min(startIdx + pageSize, total) : total

  const hasFooter = error || footer || (paginate && total > 0) || (showRowCount && !loading && total > 0)

  const scrollRef = useRef(null)
  const [edges, setEdges] = useState({ left: false, right: false })
  const updateEdges = () => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setEdges({ left: el.scrollLeft > 1, right: max > 1 && el.scrollLeft < max - 1 })
  }
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateEdges()
    const raf = requestAnimationFrame(updateEdges)
    const ro = 'ResizeObserver' in window ? new ResizeObserver(updateEdges) : null
    if (ro) ro.observe(el)
    el.addEventListener('scroll', updateEdges, { passive: true })
    window.addEventListener('resize', updateEdges)
    return () => {
      cancelAnimationFrame(raf)
      if (ro) ro.disconnect()
      el.removeEventListener('scroll', updateEdges)
      window.removeEventListener('resize', updateEdges)
    }
  }, [total, visibleRows.length, orderedColumns.length, loading])

  const skeletonClass = 'rounded-full bg-line animate-pulse'

  return (
    <div
      className={`bg-card rounded-2xl border border-line shadow-soft overflow-hidden ${className}`}
    >
      {/* ── Header: title | toolbar + filter button ── */}
      {(title || subtitle || toolbar || hasFilters) && (
        <div>
          <div className="px-6 pt-5 pb-4 border-b border-line">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="min-w-0">
                {title && <h3 className="text-base font-semibold text-ink leading-snug">{title}</h3>}
                {subtitle && <p className="text-[13px] text-muted mt-1 leading-snug">{subtitle}</p>}
              </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {toolbar}

              {hasFilters && (
                <button
                  type="button"
                  onClick={() => setFiltersOpen((o) => !o)}
                  aria-expanded={filtersOpen}
                  className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full text-sm font-medium border transition-[transform,background-color,color] duration-150 active:scale-[0.98] ${
                    filtersOpen || activeCount > 0
                      ? 'bg-brand-50 text-brand-700 border-brand-700/40'
                      : 'bg-white text-ink border-line hover:bg-page'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                  </svg>
                  Filter
                  {activeCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full text-xs font-semibold flex items-center justify-center tabular-nums bg-brand-700 text-white">
                      {activeCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {hasFilters && (
            <div
              className={`grid transition-all duration-300 ease-in-out ${filtersOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
            >
              <div className="overflow-hidden min-h-0">
                <div className="flex flex-wrap items-end gap-4">
                  {normFilters.filter((f) => f.options.length > 0).map((f) => {
                    const currentVal = filterSel[f.key] ? [...filterSel[f.key]][0] || '' : ''
                    return (
                      <div key={f.key} className="min-w-[200px] max-w-[320px] flex-1">
                        <label className="block text-sm font-medium text-ink mb-1.5">{f.label}</label>
                        <select
                          value={currentVal}
                          onChange={(e) => setFilterValue(f.key, e.target.value)}
                          className="w-full h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all appearance-none cursor-pointer"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                          }}
                        >
                          <option value="">All</option>
                          {f.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      )}

      {/* ── Table (screens ≥ md) ── */}
      <div className="relative hidden md:block">
        <div
          ref={scrollRef}
          className={stickyHeader ? `overflow-auto overscroll-x-contain ${stickyMaxHeight}` : 'overflow-x-auto overscroll-x-contain'}
        >
          <table className="w-full border-collapse" style={{ minWidth }}>
            <thead className={stickyHeader ? 'sticky top-0 z-10' : undefined}>
              <tr className="border-y border-line">
                {orderedColumns.map((c) => {
                  const isSorted = sort.key === c.key
                  return (
                    <th
                      key={c.key}
                      style={c.width ? { width: c.width } : undefined}
                      onClick={() => toggleSort(c)}
                      className={`${headPad} bg-page text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${alignClass(c.align)} text-muted ${c.sortable ? 'cursor-pointer select-none hover:text-ink transition-colors' : ''} ${c.headerClass || ''}`}
                    >
                      <span className={`inline-flex items-center gap-1.5 ${c.align === 'right' ? 'flex-row-reverse' : ''}`}>
                        {c.header}
                        {c.sortable && <SortIcon state={isSorted ? sort.dir : null} />}
                      </span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={i} className="bg-card">
                    {orderedColumns.map((c) => (
                      <td key={c.key} className={cellPad}>
                        <div className={`h-3.5 ${skeletonClass}`} style={{ width: `${38 + ((i * 11 + String(c.key).length * 5) % 42)}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : total === 0 || (error && rows.length === 0) ? (
                <tr>
                  <td colSpan={orderedColumns.length} className="px-5 py-14">
                    <EmptyState
                      activeCount={activeCount}
                      onClearFilters={clearFilters}
                      emptyTitle={emptyTitle}
                      emptyMessage={emptyMessage}
                    />
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => (
                  <tr key={row[keyField]} className="group bg-card transition-colors duration-200 hover:bg-[#F9FAFB]">
                    {orderedColumns.map((c) => (
                      <td
                        key={c.key}
                        className={`${cellPad} text-sm text-ink align-middle ${alignClass(c.align)} ${c.cellClass || ''}`}
                      >
                        {c.render ? c.render(row) : row[c.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-line to-transparent transition-opacity duration-200 ${edges.left ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-line to-transparent transition-opacity duration-200 ${edges.right ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* ── Mobile card list (screens < md) ── */}
      <div className="md:hidden">
        {loading ? (
          <div className="divide-y divide-line">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <div key={i} className="px-4 py-4 space-y-3">
                <div className={`h-4 w-2/3 ${skeletonClass}`} />
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className={`h-3 w-11/12 ${skeletonClass}`} />
                  <div className={`h-3 w-3/5 ${skeletonClass}`} />
                  <div className={`h-3 w-2/3 ${skeletonClass}`} />
                  <div className={`h-3 w-4/5 ${skeletonClass}`} />
                </div>
              </div>
            ))}
          </div>
        ) : total === 0 ? (
          <div className="px-5 py-12">
            <EmptyState activeCount={activeCount} onClearFilters={clearFilters} emptyTitle={emptyTitle} emptyMessage={emptyMessage} />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {visibleRows.map((row) => (
              <div key={row[keyField]} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {primaryCol && (
                      <div className="text-sm font-medium text-ink leading-snug break-words">{renderCell(primaryCol, row)}</div>
                    )}
                  </div>
                  {actionCols.map((c) => (
                    <div key={c.key} className="shrink-0 -mr-1">
                      {c.render && c.render(row)}
                    </div>
                  ))}
                </div>
                {restCols.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {restCols.map((c) => (
                      <div key={c.key} className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-0.5">{c.header}</p>
                        <div className="text-sm text-ink break-words">{renderCell(c, row)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      {hasFooter ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 border-t border-line">
          {error ? (
            <p className="text-xs text-danger-600 font-medium">{error}</p>
          ) : (
            <p className="text-xs text-muted">
              Showing <span className="font-semibold text-ink">{showingFrom}</span>
              {paginate && (
                <>
                  To <span className="font-semibold text-ink">{showingTo}</span>
                </>
              )}{' '}
              of <span className="font-semibold text-ink">{total}</span> entries
            </p>
          )}

          {paginate && totalPages > 1 && !error && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => go(current - 1)}
                disabled={current === 1}
                className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-muted hover:bg-page hover:text-ink disabled:opacity-60 disabled:pointer-events-none transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
                aria-label="Previous page"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>

              {pageList(current, totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-muted text-sm">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => go(p)}
                    className={`w-8 h-8 rounded-full border text-sm font-medium tabular-nums transition-[transform,background-color,color] duration-150 active:scale-[0.98] ${
                      p === current
                        ? 'bg-brand-700/8 border-brand-700 text-brand-700 font-semibold'
                        : 'border-line text-muted hover:bg-page hover:text-ink'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => go(current + 1)}
                disabled={current === totalPages}
                className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-muted hover:bg-page hover:text-ink disabled:opacity-60 disabled:pointer-events-none transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
                aria-label="Next page"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          )}

          {footer && <div className="text-xs text-muted">{footer}</div>}
        </div>
      ) : null}
    </div>
  )
}

export default Table