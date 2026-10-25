/**
 * StockOutPage — record outgoing / removed stock.
 * Requires a REASON (sale / damaged / expired / loss / theft / transfer-out)
 * because unexplained removals are the loss scenario this app prevents.
 * Actor id is always attached for the full audit trail.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { stockApi } from '../api/stockApi'
import { productApi } from '../api/productApi'
import { useAuth } from '../hooks/useAuth'
import { useToastContext } from '../context/ToastContext'
import { formatCurrency } from '../utils/formatCurrency'
import { valueOfMovement } from '../utils/pricing'
import { formatRelativeTime } from '../utils/formatDate'
import { CATEGORY_COLORS } from '../constants/productCategories'
import CustomerPicker from '../components/stock/CustomerPicker'

/* -- constants ------------------------------------------------------ */
const REASONS_OUT = [
  { value: 'sale', label: 'Sale', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'damaged', label: 'Damaged', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'expired', label: 'Expired', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'theft', label: 'Theft / Loss', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'transfer', label: 'Transfer Out', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'other', label: 'Other', color: 'bg-gray-50 text-gray-700 border-gray-200' },
]

const CAT_COLORS = CATEGORY_COLORS

/* -- SVG Icons ------------------------------------------------------ */
const ICON_PATHS = {
  arrowUp: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 21V9m0 0l-4 4m4-4l4 4M4 7h16" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" /></>,
  x: <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />,
  check: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
  box: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
  history: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  alert: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></>,
  spinner: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 1 0 9 9" />,
  minus: <line x1="5" y1="12" x2="19" y2="12" />,
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
    try { setResults((await productApi.search(q)).slice(0, 8)) }
    catch { setResults([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!open) return
    if (query.trim().length === 0) { loadInitial(); return }
    const t = setTimeout(() => doSearch(query), 200)
    return () => clearTimeout(t)
  }, [query, open, doSearch, loadInitial])

  useEffect(() => { if (open && !selected) { loadInitial(); setTimeout(() => inputRef.current?.focus(), 50) } }, [open, selected, loadInitial])
  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (selected) {
    const stockWarning = selected.quantity <= selected.reorderLevel
    return (
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${stockWarning ? 'border-amber-200 bg-amber-50/50' : 'border-brand-200 bg-brand-50/50'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${stockWarning ? 'bg-amber-100' : 'bg-brand-100'}`}>
          {selected.photo ? (
            <img src={selected.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <Icon name="box" className={`w-5 h-5 ${stockWarning ? 'text-amber-700' : 'text-brand-700'}`} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink truncate">{selected.name}</p>
          <p className="text-xs text-muted">{selected.sku} · {selected.quantity} units available</p>
          <p className={`text-xs font-medium mt-0.5 ${stockWarning ? 'text-amber-600' : 'text-brand-600'}`}>
            {Number(selected.piecesPerCarton) || 1} {selected.unit || 'pcs'} per carton{stockWarning ? ' · Low stock · reorder at ' + selected.reorderLevel : ''}
          </p>
          {selected.status && selected.status !== 'VERIFIED' && (
            <p className="text-xs font-medium mt-0.5 text-amber-600">Not verified — can't be sold until the manager verifies it.</p>
          )}
        </div>
        <button type="button" onClick={() => onSelect(null)} className="rounded-full p-1.5 text-gray-400 transition-[transform,background-color,color] duration-150 hover:bg-white/60 hover:text-ink active:scale-[0.98]">
          <Icon name="x" className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => setOpen(true)}
        className="flex h-11 w-full items-center gap-3 rounded-lg border border-line bg-white px-4 text-left transition-colors hover:border-brand-500">
        <Icon name="search" className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-sm text-muted">Search product by name or SKU…</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-line rounded-xl shadow-xl overflow-hidden">
            <div className="p-2 border-b border-line">
              <div className="flex items-center gap-2 px-2">
                <Icon name="search" className="w-4 h-4 text-gray-400 shrink-0" />
                <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type product name or SKU…"
                  className="flex-1 text-sm outline-none py-1.5 text-ink placeholder-gray-400" />
                {loading && <Icon name="spinner" className="w-4 h-4 text-brand-600 animate-spin" />}
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {results.length === 0
                ? <p className="text-center text-sm text-muted py-6">No products found</p>
                : results.map((p) => (
                  <button key={p.id} type="button" onClick={() => { onSelect(p); setOpen(false); setQuery('') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Icon name="box" className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                      <p className={`text-xs ${p.quantity <= p.reorderLevel ? 'text-amber-600 font-medium' : 'text-muted'}`}>{p.sku} · {p.quantity} in stock{p.quantity <= p.reorderLevel ? ' · low stock' : ''}</p>
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
export default function StockOutPage() {
  const { user } = useAuth()
  const { showToast } = useToastContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const [product, setProduct] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [cartons, setCartons] = useState('')
  const [pieces, setPieces] = useState('')
  const [reason, setReason] = useState('sale')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [recentMovements, setRecentMovements] = useState([])
  const [submitted, setSubmitted] = useState(null)

  /* Prefill from a shared-product chat link: /stock/out?productId=… */
  const prefillId = Number(searchParams.get('productId'))
  useEffect(() => {
    if (!prefillId) return
    let active = true
    productApi
      .get(prefillId)
      .then((p) => {
        if (!active) return
        if (p && Number(p.shopId) === Number(user?.shopId)) {
          setProduct(p)
          setCartons('')
          setPieces('')
          showToast(`${p.name} selected — enter what to remove.`, 'success')
        } else {
          showToast('That product does not belong to this shop.', 'error')
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setSearchParams({}, { replace: true })
      })
    return () => {
      active = false
    }
  }, [])

  const maxQty = product?.quantity || 0
  const piecesPerCarton = Number(product?.piecesPerCarton) || 1
  const rawCartons = Number(cartons) || 0
  const rawPieces = Number(pieces) || 0
  const fullCartons = Math.floor(rawCartons)
  const partialPieces = Math.round((rawCartons - fullCartons) * piecesPerCarton)
  const effectiveLoose = partialPieces + rawPieces
  const totalPieces = fullCartons * piecesPerCarton + effectiveLoose
  const openedPieces = piecesPerCarton > 1 && product ? maxQty % piecesPerCarton : 0
  const openingNewCarton = product && openedPieces > 0 && rawCartons > 0

  const loadRecent = useCallback(async () => {
    try {
      const movements = await stockApi.getMovements({ type: 'OUT', limit: 12 })
      setRecentMovements(movements)
    } catch {
      setRecentMovements([])
    }
  }, [])

  useEffect(() => { loadRecent() }, [loadRecent])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!product) { showToast('Please select a product', 'error'); return }
    if (!customer) { showToast('Record who is taking the stock (customer or Walk-in)', 'error'); return }
    const qtyNum = totalPieces
    if (!qtyNum || qtyNum <= 0) { showToast('Enter at least one carton or piece', 'error'); return }
    if (qtyNum > maxQty) { showToast(`Cannot take out more than ${maxQty} units in stock`, 'error'); return }
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
        reason,
        note: note.trim() || undefined,
        actorId: user?.id,
        actorName: user?.name || user?.username || 'Manager',
        customerId: customer?.id,
        customerName: customer?.name,
        customerPhone: customer?.phone || undefined,
      }
      await stockApi.recordStockOut(payload)
      await loadRecent()
      setSubmitted({ productName: product.name, qty: qtyNum })
      setProduct(null); setCustomer(null); setCartons(''); setPieces(''); setReason('sale'); setNote('')
      showToast(`-${qtyNum} · ${product.name} recorded`, 'success')
      setTimeout(() => setSubmitted(null), 4000)
    } catch (err) {
      showToast(err.message || 'Could not record stock out', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const overLimit = product && totalPieces > maxQty
  const looseOver = product && piecesPerCarton > 1 && effectiveLoose > piecesPerCarton
  const willCritical = product && (product.quantity - totalPieces) <= product.reorderLevel && !overLimit

  return (
    <div className="min-h-full bg-page p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
            <Icon name="arrowUp" className="w-5 h-5 text-red-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Stock Out</h1>
            <p className="text-sm text-muted mt-1">Record sales — removals — damaged — expired goods</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-3">
          <div className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-line bg-page/60">
              <h2 className="text-sm font-semibold text-ink">Record Outgoing Stock</h2>
              <p className="text-xs text-muted mt-0.5">Every removal needs a reason.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <AnimatePresence>
                {submitted && (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                    className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <Icon name="check" className="w-4 h-4 text-red-700" />
                    </div>
                    <p className="text-sm font-medium text-red-800">-{submitted.qty} · {submitted.productName} recorded</p>
                  </motion.div>
                )}
              </AnimatePresence>

<div>
                <label className="block text-sm font-medium text-ink mb-1.5">Product <span className="text-red-500">*</span></label>
                <ProductPicker selected={product} onSelect={setProduct} shopId={user?.shopId} />
              </div>

              {/* Customer — who is taking the stock */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Customer <span className="text-red-500">*</span></label>
                <CustomerPicker value={customer} onChange={setCustomer} />
              </div>

              {/* Opened carton reminder */}
              {product && openedPieces > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${openingNewCarton ? 'bg-amber-50 border-amber-300' : 'bg-amber-50/70 border-amber-200'}`}>
                  <Icon name="alert" className={`w-5 h-5 mt-0.5 shrink-0 ${openingNewCarton ? 'text-amber-600' : 'text-amber-500'}`} />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold text-amber-800 ${openingNewCarton ? '' : ''}`}>
                      {openingNewCarton ? 'You are opening a new carton!' : 'Opened carton with pcs remaining'}
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      {openedPieces} loose {product.unit || 'pcs'} are left from a carton that has been opened/touched (a full carton is {piecesPerCarton} {product.unit || 'pcs'}).
                    </p>
                    {openingNewCarton && (
                      <p className="text-xs font-medium text-amber-800 mt-1">
                        Sell the {openedPieces} loose pcs first before taking from a new carton — or enter {openedPieces} loose to finish the opened carton.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Reason chips · required */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Reason <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {REASONS_OUT.map((r) => (
                    <button key={r.value} type="button" onClick={() => setReason(r.value)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-2.5 text-sm font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.98] ${reason === r.value ? 'bg-brand-700 text-white border-brand-700' : `${r.color} hover:opacity-80`}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity with stock bar */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Quantity to Remove <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <input type="number" min="0" step="0.5" value={cartons} onChange={(e) => setCartons(e.target.value)} placeholder="0"
                        className={`h-11 w-full rounded-lg border bg-white px-4 pr-14 text-sm text-ink placeholder:text-muted/55 transition-all focus:outline focus:outline-2 ${overLimit ? 'border-red-400 focus:border-red-500 focus:outline-red-500/25' : 'border-line focus:border-brand-500 focus:outline-brand-500/25'}`} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted font-semibold">cartons</span>
                    </div>
                    {product && (
                      <p className="text-xs text-gray-400 mt-1">1 carton = {piecesPerCarton} {product.unit || 'pcs'} — halves allowed (e.g. 3.5)</p>
                    )}
                  </div>
                  <div>
                    <div className="relative">
                      <input type="number" min="0" max={piecesPerCarton > 1 ? piecesPerCarton : undefined} value={pieces} onChange={(e) => setPieces(e.target.value)} placeholder="0"
                        className={`h-11 w-full rounded-lg border bg-white px-4 pr-14 text-sm text-ink placeholder:text-muted/55 transition-all focus:outline focus:outline-2 ${(overLimit || looseOver) ? 'border-red-400 focus:border-red-500 focus:outline-red-500/25' : 'border-line focus:border-brand-500 focus:outline-brand-500/25'}`} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted font-semibold">{product?.unit || 'pcs'}</span>
                    </div>
                  </div>
                </div>

                {product && totalPieces > 0 && (
                  <div className="mt-2.5 flex items-center justify-between rounded-xl bg-page/70 border border-line px-4 py-2.5">
                    <span className="text-xs text-muted">
                      {fullCartons} carton{fullCartons !== 1 ? 's' : ''} + {effectiveLoose} leftover
                    </span>
                    <span className={`text-xs font-bold ${overLimit ? 'text-red-600' : 'text-ink'}`}>
                      = {totalPieces} {product.unit || 'pcs'}
                      {!overLimit && <span className="text-muted font-medium"> · After: {Math.max(0, maxQty - totalPieces)} left</span>}
                    </span>
                  </div>
                )}

                {product && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>Stock level</span><span>{maxQty} units</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full transition-all ${overLimit ? 'bg-red-500' : willCritical ? 'bg-amber-500' : 'bg-brand-500'}`}
                        animate={{ width: `${Math.max(0, Math.min(100, ((maxQty - Math.max(0, totalPieces)) / maxQty) * 100))}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
                {overLimit && <p className="text-xs text-red-600 mt-1.5 font-medium">Cannot exceed {maxQty} units available</p>}
                {looseOver && <p className="text-xs text-red-600 mt-1.5 font-medium">Loose {product.unit || 'pieces'} can't exceed {piecesPerCarton} per carton — count a full carton instead</p>}
                {willCritical && <p className="text-xs text-amber-600 mt-1.5 font-medium">This will take stock below the reorder level ({product.reorderLevel})</p>}
              </div>

              {/* Revenue preview for sales */}
              {reason === 'sale' && totalPieces > 0 && product && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-2.5 flex justify-between items-center">
                  <span className="text-xs text-blue-700 font-medium">Sale revenue (est.)</span>
                  <span className="text-sm font-bold text-blue-800">{formatCurrency(valueOfMovement({ price: product.price, unitPrice: product.unitPrice, piecesPerCarton, cartons: fullCartons, pieces: effectiveLoose }))}</span>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Note</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                  placeholder={reason === 'sale' ? 'Customer name, order ref…' : reason === 'damaged' ? 'Describe the damage…' : reason === 'theft' ? 'Describe what happened…' : 'Additional details…'}
                  className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting || !product || totalPieces <= 0 || overLimit || looseOver}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-danger-600 px-5 py-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-danger-700 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
                  {submitting ? <><Icon name="spinner" className="w-4 h-4 animate-spin" /> Recording…</> : <><Icon name="minus" className="w-4 h-4" /> Record Stock Out</>}
                </button>
                <button type="button" onClick={() => { setProduct(null); setCustomer(null); setCartons(''); setPieces(''); setReason('sale'); setNote(''); setSubmitted(null) }}
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
              <h2 className="text-sm font-semibold text-ink">Recent Stock Out</h2>
            </div>
            <div className="divide-y divide-line max-h-[480px] overflow-y-auto">
              {recentMovements.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center px-4">
                  <Icon name="history" className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-muted">No recent OUT movements</p>
                </div>
              ) : recentMovements.map((mv, i) => (
                <motion.div key={mv.id || i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink truncate">{mv.productName}</p>
                      <p className="text-xs text-muted truncate">{mv.actor} · {mv.note || '—'}</p>
                      {Number(mv.cartons) > 0 && (
                        <p className="text-xs text-rose-500 font-medium mt-0.5">
                          {mv.cartons} carton{mv.cartons > 1 ? 's' : ''} + {mv.pieces} leftover
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-red-600">-{mv.qty}</span>
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
