/**
 * ManagePermissionsModal — assign permissions to a role.
 * Searchable checkboxes grouped by StockRwa module, per-category "select all".
 * Ported from the Soma Connect permissions dialog.
 */
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { PERMISSION_CATEGORIES } from '../../../constants/permissions'

const MatchIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 7.5 21 2M18 5l-3 3M11 11a4 4 0 1 1-5.66 5.66A4 4 0 0 1 11 11z" />
  </svg>
)

export const ManagePermissionsModal = ({
  role,
  permissions,
  selectedIds,
  onToggle,
  onToggleCategory,
  onSave,
  saving,
  onClose,
}) => {
  const [search, setSearch] = React.useState('')

  useEffect(() => {
    if (!role) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [role, onClose])

  useEffect(() => {
    setSearch('')
  }, [role])

  if (!role) return null

  const q = search.trim().toLowerCase()
  const match = (p) =>
    !q ||
    (p.name || '').toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q) ||
    (p.category || '').toLowerCase().includes(q)

  const groups = PERMISSION_CATEGORIES.map((cat) => ({
    cat,
    perms: permissions.filter((p) => (p.category || 'General') === cat).filter(match),
  })).filter((g) => g.perms.length > 0)

  const hasShown =
    groups.length === 0 &&
    (q || permissions.length === 0)

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[880px] h-[min(86vh,680px)] flex flex-col bg-card rounded-2xl border border-line shadow-soft overflow-hidden animate-[zoomIn_0.2s_ease]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 px-6 sm:px-8 pt-7 pb-5 border-b border-line">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex items-center gap-3.5 pr-10">
            <span className="w-11 h-11 rounded-2xl bg-brand-700/15 text-brand-700 flex items-center justify-center shrink-0">{MatchIcon}</span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ink">Manage permissions</h3>
              <p className="text-xs text-muted mt-0.5 truncate">
                What the <span className="font-semibold text-ink">{role.name}</span> role can do.
              </p>
            </div>
          </div>

          <div className="relative mt-5">
            <svg className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permissions…"
              className="w-full text-sm pl-10 pr-3 py-2.5 rounded-lg border border-line bg-white text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-5 space-y-5">
          {hasShown ? (
            <p className="text-sm text-muted text-center py-10">No permissions {q ? `match "${search}"` : 'available'}.</p>
          ) : (
            groups.map(({ cat, perms }) => {
              const allOn = perms.every((p) => selectedIds.has(p.id))
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between px-1 pb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{cat}</p>
                    <button
                      type="button"
                      onClick={() => onToggleCategory(perms, !allOn)}
                      className="text-xs font-semibold text-brand-700 hover:text-ink transition-colors"
                    >
                      {allOn ? 'Clear all' : 'Select all'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-page hover:border-line cursor-pointer transition-colors"
                      >
                        <input type="checkbox" checked={selectedIds.has(perm.id)} onChange={() => onToggle(perm.id)} className="peer sr-only" />
                        <span className="w-5 h-5 rounded-md border-2 border-line bg-white text-transparent peer-checked:bg-brand-700 peer-checked:border-brand-700 peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand-700/30 flex items-center justify-center shrink-0 transition-all duration-150">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-ink block truncate">{perm.name}</span>
                          {perm.description && <span className="text-xs text-muted block truncate">{perm.description}</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-line flex items-center justify-end gap-2.5 bg-card">
          <p className="mr-auto text-xs font-semibold text-muted">{selectedIds.size} selected</p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm font-medium bg-white text-ink border border-line hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2 rounded-full text-sm font-medium bg-brand-700 text-white hover:bg-brand-800 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {saving ? 'Saving…' : 'Save permissions'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ManagePermissionsModal