/**
 * StockCheckPage — stock audit / stock-check flow.
 * Manager starts a session, walks the shelves, scans each product QR
 * (or types the SKU/name), enters the physically-counted quantity,
 * and on submit gets a full discrepancy report from the backend. Any gap
 * between expected and counted flags that product for investigation.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stockApi } from '../api/stockApi'
import { productApi } from '../api/productApi'
import { useAuth } from '../hooks/useAuth'
import { useToastContext } from '../context/ToastContext'
import { formatRelativeTime } from '../utils/formatDate'
import { CATEGORY_COLORS } from '../constants/productCategories'

/* -- helpers -------------------------------------------------------- */
const CAT_COLORS = CATEGORY_COLORS

/* -- SVG Icons ------------------------------------------------------ */
const ICON_PATHS = {
  clipboard: <><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" /></>,
  x: <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />,
  check: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
  box: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>,
  alert: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></>,
  spinner: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 1 0 9 9" />,
  flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>,
  history: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  play: <><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></>,
}
const Icon = ({ name, className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {ICON_PATHS[name]}
  </svg>
)

/* -- Product Search Row -------------------------------------------- */
function ProductSearchRow({ onAdd, addedIds, shopId }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const loadInitial = useCallback(async () => {
    setLoading(true)
    try {
      const list = await productApi.list({ shopId })
      setResults(list.filter(p => !addedIds.has(p.id)).slice(0, 8))
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [shopId, addedIds])

  const doSearch = useCallback(async (q) => {
    setLoading(true)
    try { setResults((await productApi.search(q)).filter(p => !addedIds.has(p.id)).slice(0, 8)) }
    catch { setResults([]) }
    finally { setLoading(false) }
  }, [addedIds])

  useEffect(() => {
    if (!open) return
    if (query.trim().length === 0) { loadInitial(); return }
    const t = setTimeout(() => doSearch(query), 200)
    return () => clearTimeout(t)
  }, [query, open, addedIds, doSearch, loadInitial])

  useEffect(() => { if (open) { loadInitial(); setTimeout(() => inputRef.current?.focus(), 50) } }, [open, loadInitial])
  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-page/60">
        <Icon name="search" className="w-4 h-4 text-gray-400 shrink-0" />
        <input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Add product to check list by name or SKU…"
          className="flex-1 text-sm outline-none bg-transparent py-0.5 text-ink placeholder-gray-400" />
        {loading && <Icon name="spinner" className="w-4 h-4 text-brand-600 animate-spin" />}
      </div>
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 z-30 bg-white border border-line rounded-b-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
            {results.map((p) => (
              <button key={p.id} type="button"
                onClick={() => { onAdd(p); setQuery(''); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon name="box" className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                  <p className="text-xs text-muted">{p.sku} · Expected: {p.quantity}</p>
                </div>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${CAT_COLORS[p.category] ?? 'bg-gray-100 text-gray-500'}`}>{p.category}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* -- Check Item Row ------------------------------------------------ */
function CheckItemRow({ item, onCountChange, onRemove }) {
  const diff = item.counted !== '' ? Number(item.counted) - item.expected : null
  const hasDiff = diff !== null && diff !== 0
  const diffColor = diff > 0 ? 'text-green-600' : 'text-red-600'
  const diffLabel = diff > 0 ? `+${diff}` : String(diff)

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
      className={`flex items-center gap-3 px-4 py-3 border-b border-line ${hasDiff ? (diff < 0 ? 'bg-red-50/40' : 'bg-green-50/40') : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <Icon name="box" className="w-4 h-4 text-gray-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink truncate">{item.name}</p>
        <p className="text-xs text-muted">{item.sku} · Expected: <span className="font-semibold text-ink">{item.expected}</span></p>
      </div>
      {hasDiff && (
        <span className={`text-xs font-bold ${diffColor} w-10 text-center`}>{diffLabel}</span>
      )}
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onCountChange(item.id, Math.max(0, (Number(item.counted) || 0) - 1))}
          className="w-7 h-7 rounded-full border border-line flex items-center justify-center text-gray-500 text-lg leading-none transition-[transform,background-color,color] duration-150 hover:bg-gray-100 active:scale-[0.98]">-</button>
        <input type="number" min="0" value={item.counted}
          onChange={(e) => onCountChange(item.id, e.target.value)}
          placeholder={String(item.expected)}
          className={`w-16 text-center rounded-lg border px-2 py-1 text-sm font-semibold transition-all focus:outline focus:outline-2 focus:outline-brand-500/25 ${hasDiff && diff < 0 ? 'border-red-300 text-red-700' : hasDiff && diff > 0 ? 'border-green-300 text-green-700' : 'border-line text-ink'}`} />
        <button type="button" onClick={() => onCountChange(item.id, (Number(item.counted) || 0) + 1)}
          className="w-7 h-7 rounded-full border border-line flex items-center justify-center text-gray-500 text-lg leading-none transition-[transform,background-color,color] duration-150 hover:bg-gray-100 active:scale-[0.98]">+</button>
      </div>
      <button type="button" onClick={() => onRemove(item.id)}
        className="rounded-full p-1.5 text-gray-300 transition-[transform,background-color,color] duration-150 hover:bg-red-50 hover:text-red-500 active:scale-[0.98]">
        <Icon name="x" className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

/* -- Results Modal ------------------------------------------------- */
function ResultsModal({ session, onClose }) {
  const discrepancies = session.items.filter(i => i.counted !== '' && Number(i.counted) !== i.expected)
  const matched = session.items.filter(i => i.counted !== '' && Number(i.counted) === i.expected)
  const uncounted = session.items.filter(i => i.counted === '')

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-line flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">Audit Report</h2>
            <p className="text-xs text-muted mt-0.5">{session.items.length} products checked · {new Date(session.completedAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 transition-[transform,background-color,color] duration-150 hover:bg-gray-100 hover:text-ink active:scale-[0.98]">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-0 border-b border-line">
          {[
            { label: 'Matched', value: matched.length, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Discrepancies', value: discrepancies.length, color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Not Counted', value: uncounted.length, color: 'text-amber-700', bg: 'bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} px-6 py-4 text-center`}>
              <p className={`text-3xl font-bold tracking-tight tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {discrepancies.length > 0 && (
            <div className="p-4">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Icon name="alert" className="w-3.5 h-3.5" /> Discrepancies
              </p>
              <div className="space-y-2">
                {discrepancies.map((item) => {
                  const diff = Number(item.counted) - item.expected
                  return (
                    <div key={item.id} className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${diff < 0 ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                      <div>
                        <p className="text-sm font-semibold text-ink">{item.name}</p>
                        <p className="text-xs text-muted">Expected: {item.expected} · Counted: {item.counted}</p>
                      </div>
                      <span className={`text-sm font-bold ${diff < 0 ? 'text-red-700' : 'text-green-700'}`}>{diff > 0 ? `+${diff}` : diff}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {matched.length > 0 && (
            <div className="px-4 pb-4">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Icon name="check" className="w-3.5 h-3.5" /> All Good
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {matched.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-lg bg-green-50/60 px-3 py-2 border border-green-100">
                    <Icon name="check" className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-ink truncate">{item.name}</span>
                    <span className="text-xs text-muted ml-auto shrink-0">{item.expected} units</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-line flex justify-end gap-3">
          <button onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-2 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* -- Past session adaptation --------------------------------------- */
const toSessionShape = (check, nameById = {}) => ({
  id: check.id,
  actor: check.actor,
  startedAt: check.startedAt,
  completedAt: check.submittedAt || check.startedAt,
  items: (check.items || []).map((it) => ({
    id: it.productId,
    name: nameById[it.productId] || `Product #${it.productId}`,
    expected: it.expectedQty,
    counted: it.countedQty != null ? String(it.countedQty) : '',
  })),
  totalChecked: (check.items || []).filter((it) => it.countedQty != null).length,
  discrepancyCount: (check.items || []).filter((it) => it.countedQty != null && Number(it.countedQty) !== it.expectedQty).length,
})

/* -- Main Page ----------------------------------------------------- */
export default function StockCheckPage() {
  const { user } = useAuth()
  const { showToast } = useToastContext()
  const [phase, setPhase] = useState('idle') // idle | active | submitted
  const [items, setItems] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [completedSession, setCompletedSession] = useState(null)
  const [pastSessions, setPastSessions] = useState([])
  const [bulkLoad, setBulkLoad] = useState(false)
  const sessionStartRef = useRef(null)
  const nameByIdRef = useRef({})

  const shopId = user?.shopId

  const loadPastSessions = useCallback(async () => {
    try {
      const checks = await stockApi.listStockChecks()
      setPastSessions(checks.map((c) => toSessionShape(c, nameByIdRef.current)))
    } catch {
      setPastSessions([])
    }
  }, [])

  useEffect(() => {
    let mounted = true
    productApi.list({ shopId }).then((list) => {
      if (!mounted) return
      const map = {}
      list.forEach((p) => { map[p.id] = p.name })
      nameByIdRef.current = map
    }).catch(() => { /* names resolve to fallback labels */ })
    loadPastSessions()
    return () => { mounted = false }
  }, [shopId, loadPastSessions])

  const addedIds = new Set(items.map(i => i.id))

  const addProduct = (p) => {
    setItems(prev => [...prev, { ...p, expected: p.quantity || 0, counted: '' }])
  }

  const removeProduct = (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateCount = (id, val) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, counted: val === '' ? '' : String(Math.max(0, Number(val))) } : i))
  }

  const startSession = async () => {
    setPhase('active')
    sessionStartRef.current = new Date().toISOString()
    showToast('Audit session started', 'success')
  }

  const loadAllProducts = async () => {
    setBulkLoad(true)
    try {
      const all = await productApi.list({ shopId })
      const map = {}
      all.forEach((p) => { map[p.id] = p.name })
      nameByIdRef.current = map
      setItems(all.map(p => ({ ...p, expected: p.quantity || 0, counted: '' })))
    } catch {
      setItems([])
    } finally {
      setBulkLoad(false)
    }
  }

  const submitCheck = async () => {
    if (items.length === 0) { showToast('Add at least one product to check', 'error'); return }
    const counted = items.filter(i => i.counted !== '')
    if (counted.length === 0) { showToast('Count at least one product', 'error'); return }
    setSubmitting(true)
    try {
      const started = await stockApi.startStockCheck({
        items: items.map(i => ({ productId: i.id, expectedQty: i.expected })),
      })
      const submitted = await stockApi.submitStockCheck(started.id, {
        items: counted.map(i => ({ productId: i.id, countedQty: Number(i.counted) })),
      })
      const session = {
        id: started.id,
        actor: user?.name || user?.username || 'Manager',
        actorId: user?.id,
        startedAt: sessionStartRef.current,
        completedAt: submitted.submittedAt || new Date().toISOString(),
        items: items.map(i => ({ ...i })),
        discrepancyCount: items.filter(i => i.counted !== '' && Number(i.counted) !== i.expected).length,
        totalChecked: counted.length,
      }
      await loadPastSessions()
      setCompletedSession(session)
      setPhase('submitted')
      showToast(`Audit complete · ${session.discrepancyCount} discrepancies found`, session.discrepancyCount > 0 ? 'warning' : 'success')
    } catch (err) {
      showToast(err.message || 'Could not submit stock check', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const resetSession = () => {
    setPhase('idle')
    setItems([])
    setCompletedSession(null)
    sessionStartRef.current = null
  }

  const countedCount = items.filter(i => i.counted !== '').length
  const discrepancyCount = items.filter(i => i.counted !== '' && Number(i.counted) !== i.expected).length

  return (
    <div className="min-h-full bg-page p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <Icon name="clipboard" className="w-5 h-5 text-brand-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Stock Check</h1>
              <p className="text-sm text-muted mt-1">Audit inventory — find discrepancies</p>
            </div>
          </div>
          {phase === 'active' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-xs font-semibold text-brand-700">Session Active</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main Panel */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-3">

          {/* Idle: Start prompt */}
          {phase === 'idle' && (
            <div className="rounded-2xl border border-line bg-card shadow-soft p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <Icon name="clipboard" className="w-8 h-8 text-brand-600" />
              </div>
              <h2 className="text-sm font-semibold text-ink mb-2">Start a Stock Audit</h2>
              <p className="text-sm text-muted max-w-xs mx-auto mb-6 leading-relaxed">
                Count what's on the shelf — see any difference right away.
              </p>
              <button onClick={startSession}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                <Icon name="play" className="w-4 h-4" /> Start Audit Session
              </button>
            </div>
          )}

          {/* Active / Submitted */}
          {(phase === 'active' || phase === 'submitted') && (
            <div className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
              {/* Toolbar */}
              <div className="px-5 py-3 border-b border-line bg-page/60 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted">{items.length} products · {countedCount} counted</span>
                  {discrepancyCount > 0 && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                      <Icon name="flag" className="w-3 h-3" /> {discrepancyCount} discrepancies
                    </span>
                  )}
                </div>
                <button onClick={loadAllProducts} disabled={bulkLoad}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium text-brand-700 transition-[transform,background-color,color] duration-150 hover:bg-brand-50 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                  {bulkLoad ? <Icon name="spinner" className="w-3.5 h-3.5 animate-spin" /> : <Icon name="plus" className="w-3.5 h-3.5" />}
                  Load all products
                </button>
              </div>

              {/* Product search */}
              <ProductSearchRow onAdd={addProduct} addedIds={addedIds} shopId={shopId} />

              {/* Item list */}
              {items.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center px-4">
                  <Icon name="box" className="w-10 h-10 text-gray-300 mb-2" />
                  <p className="text-sm text-muted">No products added yet<br />Search above or load all to start</p>
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto">
                  <AnimatePresence>
                    {items.map((item) => (
                      <CheckItemRow key={item.id} item={item} onCountChange={updateCount} onRemove={removeProduct} />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Submit footer */}
              <div className="px-5 py-4 border-t border-line bg-page/60 flex gap-3">
                <button onClick={submitCheck} disabled={submitting || items.length === 0}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                  {submitting ? <><Icon name="spinner" className="w-4 h-4 animate-spin" /> Submitting…</> : <><Icon name="check" className="w-4 h-4" /> Submit Audit</>}
                </button>
                <button onClick={resetSession} className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink transition-[transform,background-color,color] duration-150 hover:bg-page active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                  Discard
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Past Sessions Sidebar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <div className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
            <div className="px-5 py-4 border-b border-line bg-page/60 flex items-center gap-2">
              <Icon name="history" className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-ink">Past Audits</h2>
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              {pastSessions.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center px-4">
                  <Icon name="history" className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-muted">No audit history yet</p>
                </div>
              ) : pastSessions.map((s, i) => (
                <div key={s.id} className="px-5 py-3.5 border-b border-line last:border-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">by {s.actor}</p>
                      <p className="text-xs text-muted">{s.totalChecked} checked · {formatRelativeTime(s.completedAt)}</p>
                    </div>
                    {s.discrepancyCount > 0
                      ? <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full shrink-0">{s.discrepancyCount} issues</span>
                      : <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full shrink-0">All OK</span>
                    }
                  </div>
                  {s.discrepancyCount > 0 && (
                    <div className="space-y-1">
                      {s.items.filter(it => it.counted !== '' && Number(it.counted) !== it.expected).slice(0, 3).map(it => {
                        const diff = Number(it.counted) - it.expected
                        return (
                          <div key={it.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted truncate">{it.name}</span>
                            <span className={`font-bold shrink-0 ml-2 ${diff < 0 ? 'text-red-600' : 'text-green-600'}`}>{diff > 0 ? `+${diff}` : diff}</span>
                          </div>
                        )
                      })}
                      {s.items.filter(it => it.counted !== '' && Number(it.counted) !== it.expected).length > 3 && (
                        <p className="text-xs text-muted">+{s.items.filter(it => it.counted !== '' && Number(it.counted) !== it.expected).length - 3} more</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Results Modal */}
      <AnimatePresence>
        {completedSession && (
          <ResultsModal session={completedSession} onClose={() => { setCompletedSession(null); resetSession() }} />
        )}
      </AnimatePresence>
    </div>
  )
}