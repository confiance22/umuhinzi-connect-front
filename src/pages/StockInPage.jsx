/**
 * StockInPage — record incoming stock (restock / purchase).
 * Managers can search & select a product, enter quantity received, unit cost,
 * supplier name and an optional note. Every movement is logged with the
 * actor id so the audit trail is complete. All data is live from the backend.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stockApi } from '../api/stockApi'
import { productApi } from '../api/productApi'
import { useAuth } from '../hooks/useAuth'
import { useToastContext } from '../context/ToastContext'
import { formatCurrency } from '../utils/formatCurrency'
import { formatRelativeTime } from '../utils/formatDate'
import { CATEGORY_COLORS } from '../constants/productCategories'

/* -- helpers -------------------------------------------------------- */
const REASONS = [
  { value: 'restock', label: 'Regular restock' },
  { value: 'purchase', label: 'New purchase' },
  { value: 'return', label: 'Supplier return' },
  { value: 'transfer', label: 'Branch transfer in' },
  { value: 'other', label: 'Other' },
]

const CAT_COLORS = CATEGORY_COLORS

/* -- SVG Icons ------------------------------------------------------ */
const ICON_PATHS = {
  arrowDown: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17h16" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" /></>,
  x: <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />,
  check: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
  box: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  history: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  truck: <><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 4v4h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>,
  spinner: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 1 0 9 9" />,
}

const Icon = ({ name, className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {ICON_PATHS[name]}
  </svg>
)

/* -- Product Picker ------------------------------------------------ */
function ProductPicker({ selected, onSelect, shopId }) {
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
      setResults(list.slice(0, 8))
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [shopId])

  const doSearch = useCallback(async (q) => {
    setLoading(true)
    try {
      const found = await productApi.search(q)
      setResults(found.slice(0, 8))
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    if (query.trim().length === 0) { loadInitial(); return }
    const t = setTimeout(() => doSearch(query), 200)
    return () => clearTimeout(t)
  }, [query, open, doSearch, loadInitial])

  useEffect(() => {
    if (open && !selected) {
      loadInitial()
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, selected, loadInitial])

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-3">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0 overflow-hidden">
          {selected.photo ? (
            <img src={selected.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <Icon name="box" className="w-5 h-5 text-brand-700" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink truncate">{selected.name}</p>
          <p className="text-xs text-muted">{selected.sku} · Current stock: {selected.quantity} units</p>
          <p className="text-xs text-brand-600 font-medium mt-0.5">{Number(selected.piecesPerCarton) || 1} {selected.unit || 'pcs'} per carton</p>
        </div>
        <button type="button" onClick={() => onSelect(null)} className="rounded-full p-1.5 text-gray-400 transition-[transform,background-color,color] duration-150 hover:bg-brand-100 hover:text-ink active:scale-[0.98]">
          <Icon name="x" className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-full items-center gap-3 rounded-lg border border-line bg-white px-4 text-left transition-colors hover:border-brand-500"
      >
        <Icon name="search" className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-sm text-muted">Search product by name or SKU…</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-line rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-line">
              <div className="flex items-center gap-2 px-2">
                <Icon name="search" className="w-4 h-4 text-gray-400 shrink-0" />
                <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type product name or SKU…"
                  className="flex-1 text-sm outline-none py-1.5 text-ink placeholder-gray-400" />
                {loading && <Icon name="spinner" className="w-4 h-4 text-brand-600 animate-spin" />}
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {results.length === 0
                ? <p className="text-center text-sm text-muted py-6">No products found</p>
                : results.map((p) => (
                  <button key={p.id} type="button"
                    onClick={() => { onSelect(p); setOpen(false); setQuery('') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Icon name="box" className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                      <p className="text-xs text-muted">{p.sku} · {p.quantity} in stock</p>
                    </div>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${CAT_COLORS[p.category] ?? 'bg-gray-100 text-gray-500'}`}>{p.category}</span>
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* -- Main Page ----------------------------------------------------- */
export default function StockInPage() {
  const { user } = useAuth()
  const { showToast } = useToastContext()
  const [product, setProduct] = useState(null)
  const [cartons, setCartons] = useState('')
  const [pieces, setPieces] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [pieceCost, setPieceCost] = useState('')
  const [supplier, setSupplier] = useState('')
  const [reason, setReason] = useState('restock')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [recentMovements, setRecentMovements] = useState([])
  const [submitted, setSubmitted] = useState(null)

  const loadRecent = useCallback(async () => {
    try {
      const movements = await stockApi.getMovements({ type: 'IN', limit: 12 })
      setRecentMovements(movements)
    } catch {
      setRecentMovements([])
    }
  }, [])

  useEffect(() => { loadRecent() }, [loadRecent])

  const piecesPerCarton = Number(product?.piecesPerCarton) || 1
  const rawCartons = Number(cartons) || 0
  const rawPieces = Number(pieces) || 0
  const fullCartons = Math.floor(rawCartons)
  const partialPieces = Math.round((rawCartons - fullCartons) * piecesPerCarton)
  const effectiveLoose = partialPieces + rawPieces
  const totalPieces = fullCartons * piecesPerCarton + effectiveLoose
  const looseOver = product && piecesPerCarton > 1 && effectiveLoose > piecesPerCarton

  const cartonCost = Number(unitCost) || 0
  const looseCost = Number(pieceCost)
  const effectiveLooseCost = looseCost > 0 ? looseCost : Math.round(cartonCost / Math.max(1, piecesPerCarton))
  const batchCost = fullCartons * cartonCost + effectiveLoose * effectiveLooseCost

  useEffect(() => {
    if (product) {
      setUnitCost(product.price != null ? String(product.price) : '')
      setPieceCost(product.unitPrice != null ? String(product.unitPrice) : '')
    }
  }, [product])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!product) { showToast('Please select a product', 'error'); return }
    const qtyNum = totalPieces
    if (!qtyNum || qtyNum <= 0) { showToast('Enter at least one carton or piece', 'error'); return }
    if (piecesPerCarton > 1 && effectiveLoose > piecesPerCarton) {
      showToast(`Loose ${product.unit || 'pieces'} can't exceed ${piecesPerCarton} per carton — count a full carton instead`, 'error')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        shopId: user?.shopId || 1,
        productId: product.id,
        productName: product.name,
        qty: qtyNum,
        cartons: fullCartons,
        pieces: effectiveLoose,
        unitCost: unitCost ? Number(unitCost) : undefined,
        pieceCost: pieceCost ? Number(pieceCost) : undefined,
        supplier: supplier.trim() || undefined,
        reason,
        note: note.trim() || undefined,
        actorId: user?.id,
        actorName: user?.name || user?.username || 'Manager',
      }
      await stockApi.recordStockIn(payload)
      await loadRecent()
      setSubmitted({ productName: product.name, qty: qtyNum })
      setProduct(null); setCartons(''); setPieces(''); setUnitCost(''); setPieceCost(''); setSupplier(''); setReason('restock'); setNote('')
      showToast(`+${qtyNum} · ${product.name} recorded`, 'success')
      setTimeout(() => setSubmitted(null), 4000)
    } catch (err) {
      showToast(err.message || 'Could not record stock in', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-full bg-page p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
            <Icon name="arrowDown" className="w-5 h-5 text-brand-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Stock In</h1>
            <p className="text-sm text-muted mt-1">Record received stock — purchases — restocks</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-3">
          <div className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-line bg-page/60">
              <h2 className="text-sm font-semibold text-ink">Record Incoming Stock</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <AnimatePresence>
                {submitted && (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                    className="flex items-center gap-3 rounded-xl bg-brand-50 border border-brand-200 px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                      <Icon name="check" className="w-4 h-4 text-brand-700" />
                    </div>
                    <p className="text-sm font-medium text-brand-800">+{submitted.qty} · {submitted.productName} recorded</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Product <span className="text-red-500">*</span></label>
                <ProductPicker selected={product} onSelect={setProduct} shopId={user?.shopId} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Full Cartons</label>
                  <div className="relative">
                    <input type="number" min="0" step="0.5" value={cartons} onChange={(e) => {
                      const v = e.target.value
                      if (v === '' || Number(v) >= 0) setCartons(v === '' ? '' : v)
                    }} placeholder="0 e.g. 3.5 = 3 + half"
                      className="h-11 w-full rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all" />
                  </div>
                  {product && (
                    <p className="text-xs text-gray-400 mt-1">1 carton = {piecesPerCarton} {product.unit || 'pcs'} — halves allowed (e.g. 3.5)</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Leftover Pieces</label>
                  <div className="relative">
                    <input type="number" min="0" max={piecesPerCarton > 1 ? piecesPerCarton : undefined} value={pieces} onChange={(e) => setPieces(e.target.value)} placeholder="0"
                      className={`h-11 w-full rounded-lg border bg-white px-4 text-sm text-ink placeholder:text-muted/55 focus:outline focus:outline-2 transition-all ${looseOver ? 'border-red-400 focus:border-red-500 focus:outline-red-500/25' : 'border-line focus:border-brand-500 focus:outline-brand-500/25'}`} />
                    {product && totalPieces > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-600 font-semibold">
                        {totalPieces} <span className="text-brand-400">{product.unit || 'pcs'}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Loose pieces outside cartons.</p>
                </div>
              </div>

              {product && (
                <div className="flex items-center justify-between rounded-xl bg-brand-50 border border-brand-100 px-4 py-2.5">
                  <span className="text-xs text-brand-700 font-medium">
                    {fullCartons} carton{fullCartons !== 1 ? 's' : ''} + {effectiveLoose} leftover = {totalPieces} {product.unit || 'pcs'}
                  </span>
                  <span className="text-xs text-brand-800 font-bold">
                    New total: {(product.quantity || 0) + totalPieces} <span className="text-brand-500 font-medium">{product.unit || 'pcs'}</span>
                  </span>
                </div>
              )}

              {looseOver && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">
                  Loose {product.unit || 'pieces'} can't exceed {piecesPerCarton} per carton — count a full carton instead
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Cost per Carton (RWF)</label>
                  <input type="number" min="0" value={unitCost} onChange={(e) => setUnitCost(e.target.value)}
                    placeholder={product ? String(product.price) : '0'}
                    className="h-11 w-full rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all" />
                  <p className="text-xs text-gray-400 mt-1">Full carton selling price — saved to the product.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Per-Piece Cost (RWF)</label>
                  <input type="number" min="0" value={pieceCost}
                    onChange={(e) => setPieceCost(e.target.value)}
                    placeholder={product ? String(Math.round((Number(unitCost) || product.price || 0) / Math.max(1, piecesPerCarton))) : '0'}
                    className="h-11 w-full rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all" />
                  <p className="text-xs text-gray-400 mt-1">Price for one loose {product?.unit || 'pcs'} — saved to the product.</p>
                </div>
              </div>

              {totalPieces > 0 && (cartonCost > 0 || effectiveLooseCost > 0) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-2.5 flex justify-between items-center">
                  <span className="text-xs text-brand-700 font-medium">Total batch cost</span>
                  <span className="text-sm font-bold text-brand-800">{formatCurrency(batchCost)}</span>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Supplier / Source</label>
                <div className="relative">
                  <Icon name="truck" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)}
                    placeholder="e.g. Azam, Bralirwa, local wholesaler…"
                    className="h-11 w-full rounded-lg border border-line bg-white pl-9 pr-4 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Reason</label>
                <div className="flex flex-wrap gap-2">
                  {REASONS.map((r) => (
                    <button key={r.value} type="button" onClick={() => setReason(r.value)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.98] ${reason === r.value ? 'bg-brand-700 text-white border-brand-700' : 'bg-white text-ink border-line hover:border-brand-300 hover:text-brand-700'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Note (optional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                  placeholder="Add a note about this delivery…"
                  className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting || !product || totalPieces <= 0 || looseOver}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                  {submitting ? <><Icon name="spinner" className="w-4 h-4 animate-spin" /> Recording…</> : <><Icon name="plus" className="w-4 h-4" /> Record Stock In</>}
                </button>
                <button type="button" onClick={() => { setProduct(null); setCartons(''); setPieces(''); setUnitCost(''); setPieceCost(''); setSupplier(''); setReason('restock'); setNote(''); setSubmitted(null) }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink transition-[transform,background-color,color] duration-150 hover:bg-page active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                  Clear
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Recent History */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <div className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
            <div className="px-5 py-4 border-b border-line bg-page/60 flex items-center gap-2">
              <Icon name="history" className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-ink">Recent Stock In</h2>
            </div>
            <div className="divide-y divide-line max-h-[480px] overflow-y-auto">
              {recentMovements.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center px-4">
                  <Icon name="history" className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-muted">No recent IN movements</p>
                </div>
              ) : recentMovements.map((mv, i) => (
                <motion.div key={mv.id || i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink truncate">{mv.productName}</p>
                      <p className="text-xs text-muted truncate">{mv.actor} · {mv.note || '—'}</p>
                      {Number(mv.cartons) > 0 && (
                        <p className="text-xs text-brand-600 font-medium mt-0.5">
                          {mv.cartons} carton{mv.cartons > 1 ? 's' : ''} + {mv.pieces} loose
                        </p>
                      )}
                      {(mv.supplier || mv.unitCost != null) && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {mv.supplier ? `${mv.supplier} · ` : ''}carton {formatCurrency(mv.unitCost || 0)}{mv.pieceCost != null ? ` · piece ${formatCurrency(mv.pieceCost)}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-brand-700">+{mv.qty}</span>
                      <p className="text-xs text-muted">{formatRelativeTime(mv.createdAt)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}