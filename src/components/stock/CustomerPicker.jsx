/**
 * CustomerPicker — searchable customer selector for stock out.
 * Lets the shop record WHO is taking stock: pick an existing customer,
 * quick-add a new one (name + phone), or tag it as a Walk-in.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { customerApi } from '../../api/customerApi'
import { useToastContext } from '../../context/ToastContext'

const WALK_IN = { name: 'Walk-in', phone: null }

const IconX = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)
const IconSearch = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)
const IconPlus = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const IconUser = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const IconSpinner = ({ className = 'w-4 h-4' }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
)

export default function CustomerPicker({ value, onChange, compact = false }) {
  const { showToast } = useToastContext()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addName, setAddName] = useState('')
  const [addPhone, setAddPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const loadCustomers = useCallback(async (q) => {
    setLoading(true)
    try {
      const list = await customerApi.list({ search: q || '' })
      setResults((Array.isArray(list) ? list : []).slice(0, 8))
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open || adding) return
    const t = setTimeout(() => loadCustomers(query), query.trim() ? 200 : 0)
    return () => clearTimeout(t)
  }, [query, open, adding, loadCustomers])

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setAdding(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (c) => {
    onChange(c)
    setOpen(false)
    setQuery('')
    setAdding(false)
  }

  const startAdd = () => {
    setAddName(query.trim())
    setAddPhone('')
    setAdding(true)
  }

  const submitNew = async () => {
    const name = addName.trim()
    if (!name) { showToast('Enter a customer name', 'error'); return }
    setSaving(true)
    try {
      const created = await customerApi.create({ name, phone: addPhone.trim() || undefined })
      select(created)
    } catch (err) {
      const existingId = err?.response?.data?.errors?.customer
      if (err?.response?.status === 409 && existingId) {
        select({ id: existingId, name: addName.trim(), phone: addPhone.trim() || null })
      } else {
        showToast(err?.response?.data?.message || err.message || 'Could not add customer', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-2.5">
        <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
          <IconUser className="w-4 h-4 text-brand-700" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink truncate">{value.name}</p>
          {value.phone ? <p className="text-xs text-muted">{value.phone}</p> : null}
        </div>
        <button type="button" onClick={() => onChange(null)} className="rounded-full p-1.5 text-gray-400 hover:text-ink hover:bg-white/60 transition-colors" aria-label="Remove customer">
          <IconX className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <IconSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={compact ? 'Who is taking it? (search or new)' : 'Search customer by name or phone…'}
          className={`${compact ? 'h-11' : 'h-11'} w-full rounded-lg border border-line bg-white pl-10 pr-10 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all`}
        />
        {loading && <IconSpinner className="w-4 h-4 text-brand-600 absolute right-3.5 top-1/2 -translate-y-1/2" />}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 z-40 bg-white border border-line rounded-xl shadow-xl overflow-hidden"
          >
            {!adding ? (
              <>
                <div className="max-h-56 overflow-y-auto py-1">
                  {results.length === 0 && !loading && (
                    <p className="text-center text-sm text-muted py-4">No customers yet</p>
                  )}
                  {results.map((c) => (
                    <button key={c.id} type="button" onClick={() => select(c)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50/60 transition-colors text-left">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <IconUser className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink truncate">{c.name}</p>
                        <p className="text-xs text-muted truncate">
                          {c.phone || '—'} · {c.shipments} purchase{c.shipments === 1 ? '' : 's'} · {c.totalUnits} pcs
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-line p-2 flex gap-2">
                  <button type="button" onClick={startAdd}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-50 text-brand-700 px-3 py-2 text-xs font-semibold hover:bg-brand-100 transition-colors">
                    <IconPlus className="w-3.5 h-3.5" /> Add &quot;{query.trim() || 'New customer'}&quot;
                  </button>
                  <button type="button" onClick={() => select(WALK_IN)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 text-ink px-3 py-2 text-xs font-semibold hover:bg-gray-200 transition-colors">
                    <IconUser className="w-3.5 h-3.5" /> Walk-in
                  </button>
                </div>
              </>
            ) : (
              <div className="p-3 space-y-2">
                <p className="text-xs font-semibold text-ink">Add new customer</p>
                <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Customer name"
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25" autoFocus />
                <input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="Phone (optional)"
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25" />
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={submitNew} disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-700 text-white px-3 py-2 text-xs font-semibold hover:bg-brand-800 disabled:opacity-60 transition-colors">
                    {saving ? <IconSpinner className="w-3.5 h-3.5" /> : <IconPlus className="w-3.5 h-3.5" />} Save
                  </button>
                  <button type="button" onClick={() => setAdding(false)}
                    className="inline-flex items-center justify-center rounded-lg bg-gray-100 text-ink px-3 py-2 text-xs font-semibold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}