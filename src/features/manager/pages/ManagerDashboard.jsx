/**
 * ManagerDashboard — Shop Manager control center (mirrors the Super Admin
 * command center design). KPIs (products / stock value / low stock / workers),
 * recent stock movements, quick actions (stock in/out, check, QR, add product)
 * and a low-stock restock banner.
 */
import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { productApi } from '../../../api/productApi'
import { stockApi } from '../../../api/stockApi'
import { workerApi } from '../../../api/workerApi'
import { useToastContext } from '../../../context/ToastContext'
import { ROUTE_PATHS } from '../../../constants/routePaths'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDateTime } from '../../../utils/formatDate'

const currency = (n) => formatCurrency(n)

const firstImage = (p) => (p?.photo || (Array.isArray(p?.photos) && p.photos[0]) || null)

const timeAgo = (isoDate) => {
  if (!isoDate) return ''
  const then = new Date(isoDate).getTime()
  if (Number.isNaN(then)) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000))
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs)
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

const MOVEMENT_META = {
  IN: { label: 'Stock in', bg: 'bg-brand-50', fg: 'text-brand-700', path: 'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2' },
  OUT: { label: 'Stock out', bg: 'bg-rose-50', fg: 'text-rose-500', path: 'M12 15V3m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2' },
  CHECK: { label: 'Stock check', bg: 'bg-indigo-50', fg: 'text-indigo-500', path: 'M9 12l2 2 4-4m5-4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m5 0a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2z' },
}

export const ManagerDashboard = () => {
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [workers, setWorkers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeProduct, setActiveProduct] = useState(null)
  const { showToast } = useToastContext()

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveProduct(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      const [productsRes, movementsRes, workersRes] = await Promise.allSettled([
        productApi.list(),
        stockApi.getMovements(),
        workerApi.list(),
      ])
      if (cancelled) return

      if (productsRes.status === 'rejected') showToast('Could not load dashboard products', 'error')
      if (workersRes.status === 'rejected') showToast('Could not load staff metrics', 'error')

      setProducts(Array.isArray(productsRes.value) ? productsRes.value : [])
      setMovements(
        (Array.isArray(movementsRes.value) ? movementsRes.value : [])
          .filter((m) => m?.createdAt)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      )
      setWorkers(Array.isArray(workersRes.value) ? workersRes.value : [])
      setIsLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [showToast])

  // Recent movements grouped per product, most recent activity first.
  const productGroups = useMemo(() => {
    const map = new Map()
    for (const m of movements) {
      const key = m.productId != null ? String(m.productId) : m.productName || 'unknown'
      if (!map.has(key)) {
        map.set(key, { productId: m.productId ?? null, productName: m.productName || 'Product', movements: [], latest: m })
      }
      const group = map.get(key)
      group.movements.push(m)
      if (new Date(m.createdAt) > new Date(group.latest.createdAt)) group.latest = m
    }
    return [...map.values()].sort((a, b) => new Date(b.latest.createdAt) - new Date(a.latest.createdAt))
  }, [movements])

  const stockValue = products.reduce((sum, p) => sum + (Number(p.quantity) || 0) * (Number(p.price) || 0), 0)
  const lowStock = products.filter((p) => Number(p.quantity) <= Number(p.reorderLevel || 0))
  const lowStockSorted = [...lowStock].sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0))
  const activeWorkers = workers.filter((w) => w.enabled !== false)

  const kpiCards = [
    {
      label: 'Products in store',
      value: products.length,
      sub: `${products.length} active SKUs`,
      accent: true,
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      label: 'Stock value',
      value: currency(stockValue),
      sub: 'Total inventory value',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    },
    {
      label: 'Low stock',
      value: lowStock.length,
      sub: 'Need restocking now',
      icon: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
    },
    {
      label: 'Active workers',
      value: activeWorkers.length,
      sub: `${workers.length} on staff`,
      icon: 'M17 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
  ]

  const quickActions = [
    { label: 'Stock In', desc: 'Receive supplier delivery', to: ROUTE_PATHS.STOCK_IN, icon: 'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2' },
    { label: 'Stock Out', desc: 'Record sales or writes-off', to: ROUTE_PATHS.STOCK_OUT, icon: 'M12 15V3m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2' },
    { label: 'Stock Check', desc: 'Start a count / audit', to: ROUTE_PATHS.STOCK_CHECK, icon: 'M9 12l2 2 4-4m5-4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m5 0a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2z' },
    { label: 'Add Product', desc: 'New SKU to catalogue', to: ROUTE_PATHS.PRODUCT_ADD, icon: 'M3 3a2 2 0 0 1 2-2h6l4 4v14a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V3zm7-2l4 4M9 13h6m-6 4h6' },
    { label: 'Generate QR', desc: 'Product labels', to: ROUTE_PATHS.QR_GENERATE, icon: 'M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h.01M11 12h2M16 12h.01M12 16v.01M16 16h2M12 7v4m-4 0h8' },
  ]

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200/70 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-gray-200/70 rounded-2xl" />
          <div className="h-80 bg-gray-200/70 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <span className="inline-block text-xs font-medium uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
            Store Overview
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">Management Dashboard</h1>
          <p className="text-sm text-muted mt-1">Products, stock levels and your team at a glance.</p>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-semibold bg-brand-700 text-white rounded-full px-4 py-2.5 relative overflow-hidden">
          <span className="absolute -right-3 -bottom-3 w-14 h-14 rounded-full bg-white/25 pointer-events-none" />
          <span className="relative flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
            <span className="uppercase tracking-wide text-xs">Store Operational</span>
          </span>
          <span className="relative hidden sm:block text-xs font-medium text-white/70 before:content-['·'] before:mr-2">
            Shop 1 · Kigali
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`relative rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
              card.accent ? 'bg-ink border-ink' : 'bg-card border-line shadow-soft'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.accent ? 'bg-brand-700 text-white' : 'bg-page text-ink'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </span>
            </div>
            <p
              className={`font-bold tracking-tight tabular-nums mt-4 ${
                card.label === 'Stock value' ? 'text-2xl' : 'text-3xl'
              } ${card.accent ? 'text-white' : 'text-ink'}`}
            >
              {card.value}
            </p>
            <p className={`text-sm font-medium mt-0.5 ${card.accent ? 'text-white/80' : 'text-muted'}`}>{card.label}</p>
            <p className={`text-xs mt-2 ${card.accent ? 'text-white/50' : 'text-gray-400'}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-line rounded-2xl shadow-soft">
          <div className="flex items-center justify-between px-6 py-4 border-b border-line">
            <h3 className="text-sm font-semibold text-ink">Recent Stock Movements</h3>
            <Link to={ROUTE_PATHS.STOCK_CHECK} className="text-xs font-medium text-gray-400 hover:text-ink transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-line">
            {movements.length === 0 ? (
              <div className="px-6 py-14 text-center text-sm text-gray-400">No stock movements recorded yet.</div>
            ) : (
              productGroups.slice(0, 6).map((g) => {
                const m = g.latest
                const meta = MOVEMENT_META[m.type] || MOVEMENT_META.CHECK
                const prod = g.productId != null ? products.find((p) => String(p.id) === String(g.productId)) : null
                const photo = m.photo || firstImage(prod)
                return (
                  <div
                    key={g.productName}
                    onClick={() => setActiveProduct(g)}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-page border border-line overflow-hidden flex items-center justify-center shrink-0">
                      {photo ? (
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-300 font-semibold">{g.productName?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <span className={`w-9 h-9 rounded-xl ${meta.bg} ${meta.fg} flex items-center justify-center shrink-0`}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={meta.path} />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">
                        {g.productName}
                        {g.count > 1 && <span className="text-gray-400 font-normal"> · {g.count} movements</span>}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {m.note ? `• ${m.note} · ` : ''}{m.actor} · {timeAgo(m.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full shrink-0 ${
                        m.type === 'IN'
                          ? 'text-brand-700 bg-brand-50'
                          : m.type === 'OUT'
                          ? 'text-rose-500 bg-rose-50'
                          : 'text-indigo-500 bg-indigo-50'
                      }`}
                    >
                      {m.type === 'IN' ? `+${m.qty}` : m.type === 'OUT' ? `−${m.qty}` : `${m.qty}`}
                    </span>
                    <span className="hidden sm:block text-xs font-semibold uppercase tracking-wide text-gray-400 bg-gray-100 px-2 py-1 rounded-full shrink-0">
                      {g.count > 1 ? `${g.count} total` : meta.label}
                    </span>
                    <svg className="w-4 h-4 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-line rounded-2xl shadow-soft p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Quick Actions</h3>
            <div className="space-y-1.5">
              {quickActions.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-page transition-colors"
                >
                  <span className="w-10 h-10 rounded-xl bg-page group-hover:bg-brand-700 text-ink group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={link.icon} />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{link.label}</p>
                    <p className="text-xs text-gray-400 truncate">{link.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-ink ml-auto transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-brand-700 p-6 relative overflow-hidden shadow-[0_8px_32px_rgba(15,118,110,0.25)]">
            <div className="absolute -bottom-10 -right-8 w-32 h-32 rounded-full bg-white/20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-brand-800/40 blur-2xl pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">Restock alert</p>
              <p className="text-xl font-bold text-white mt-2 leading-snug">
                {lowStock.length > 0
                  ? `${lowStock.length} product${lowStock.length > 1 ? 's' : ''} below reorder level`
                  : 'Stock levels healthy'}
              </p>
              {lowStockSorted.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {lowStockSorted.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="text-white/85 font-medium truncate pr-2">{p.name}</span>
                      <span className="text-white bg-white/15 px-2 py-0.5 rounded-full shrink-0 tabular-nums">{p.quantity} left</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <Link
                to={lowStock.length > 0 ? ROUTE_PATHS.PRODUCTS : ROUTE_PATHS.STOCK_IN}
                className="inline-flex items-center justify-center gap-2 mt-5 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-ink-soft transition-[transform,background-color,color,gap] duration-150 active:scale-[0.98] hover:gap-2.5"
              >
                {lowStock.length > 0 ? 'Restock products' : 'Receive stock'}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Movement detail drawer — portaled to <body> so the blurred backdrop
          always covers the full screen with curved left edges */}
      {createPortal(
        <AnimatePresence>
          {activeProduct && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
                onClick={() => setActiveProduct(null)}
              />
              <motion.aside
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-3xl bg-card shadow-2xl flex flex-col rounded-l-3xl overflow-hidden"
                role="dialog"
                aria-modal="true"
              >
                <ProductLedgerDrawerBody
                  product={activeProduct}
                  currentProduct={products.find((p) => String(p.id) === String(activeProduct.productId))}
                  onClose={() => setActiveProduct(null)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

const ProductLedgerDrawerBody = ({ product, currentProduct, onClose }) => {
  const rows = [...product.movements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const latest = rows[0]
  const drawerPhoto = firstImage(currentProduct) || latest?.photo || null
  const totals = rows.reduce(
    (acc, m) => {
      if (m.type === 'IN') acc.unitsIn += Number(m.qty) || 0
      else if (m.type === 'OUT') acc.unitsOut += Number(m.qty) || 0
      return acc
    },
    { unitsIn: 0, unitsOut: 0 }
  )
  const ppc = Math.max(1, Number(currentProduct?.piecesPerCarton) || 1)
  const onHand = Number(currentProduct?.quantity) || 0
  const toCartons = (units) => {
    const full = Math.floor(units / ppc)
    const loose = units % ppc
    return { full, loose, total: full + (loose > 0 ? 1 : 0) }
  }
  const stockC = toCartons(onHand)
  const receivedC = toCartons(totals.unitsIn)
  const removedC = toCartons(totals.unitsOut)
  const describe = (c) =>
    c.loose > 0 ? `${c.full} full + ${c.loose} loose` : `${c.full} cartons`
  const meta = MOVEMENT_META[latest.type] || MOVEMENT_META.CHECK
  const signedQty = (m) =>
    m.type === 'IN' ? `+${m.qty}` : m.type === 'OUT' ? `−${m.qty}` : `${m.qty}`
  const qtyColor = (m) =>
    m.type === 'IN' ? 'text-brand-700' : m.type === 'OUT' ? 'text-rose-500' : 'text-indigo-500'
  const reference = (m) =>
    m.type === 'OUT'
      ? [m.customerName, m.customerPhone].filter(Boolean).join(' · ') || '—'
      : m.type === 'IN'
      ? m.supplier || '—'
      : '—'

  return (
    <>
      <div className="px-6 py-4 border-b border-line flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-page border border-line overflow-hidden flex items-center justify-center shrink-0">
            {drawerPhoto ? (
              <img src={drawerPhoto} alt={product.productName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-semibold text-gray-300">{product.productName?.charAt(0) || '?'}</span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-ink truncate">{product.productName}</h2>
            <p className="text-xs text-muted truncate">
              {meta.label} · {product.movements.length} movement{product.movements.length === 1 ? '' : 's'} · latest by {latest.actor} · {timeAgo(latest.createdAt)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-gray-400 hover:text-ink hover:bg-page transition-colors shrink-0 ml-3"
          aria-label="Close movement details"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="px-6 py-4 border-b border-line grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Movements</p>
          <p className="text-lg font-bold text-ink tabular-nums">{product.movements.length}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Stock on Hand</p>
          <p className="text-lg font-bold text-emerald-600 tabular-nums">{stockC.total} cartons</p>
          <p className="text-[11px] text-muted tabular-nums">{onHand} pieces · {describe(stockC)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Received</p>
          <p className="text-lg font-bold text-ink tabular-nums">{receivedC.total} cartons</p>
          <p className="text-[11px] text-muted tabular-nums">{totals.unitsIn} pieces · {describe(receivedC)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Removed</p>
          <p className="text-lg font-bold text-rose-500 tabular-nums">{removedC.total} cartons</p>
          <p className="text-[11px] text-muted tabular-nums">{totals.unitsOut} pieces · {describe(removedC)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rows.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-medium text-ink">No movements yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-line">
                  <th className="px-6 py-3 font-semibold whitespace-nowrap">Date &amp; Time</th>
                  <th className="px-6 py-3 font-semibold whitespace-nowrap">Type</th>
                  <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">Qty</th>
                  <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">Cartons</th>
                  <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">Loose</th>
                  <th className="px-6 py-3 font-semibold whitespace-nowrap">Supplier / Customer</th>
                  <th className="px-6 py-3 font-semibold whitespace-nowrap">Reason / Note</th>
                  <th className="px-6 py-3 font-semibold whitespace-nowrap">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((m) => {
                  const t = MOVEMENT_META[m.type] || MOVEMENT_META.CHECK
                  return (
                    <tr key={m.id} className="hover:bg-page/50 transition-colors">
                      <td className="px-6 py-3 text-muted whitespace-nowrap">{formatDateTime(m.createdAt)}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${t.bg} ${t.fg}`}>
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d={t.path} />
                          </svg>
                          {t.label}
                        </span>
                      </td>
                      <td className={`px-6 py-3 text-right font-medium tabular-nums whitespace-nowrap ${qtyColor(m)}`}>{signedQty(m)}</td>
                      <td className="px-6 py-3 text-right text-ink tabular-nums whitespace-nowrap">{m.cartons || 0}</td>
                      <td className="px-6 py-3 text-right text-ink tabular-nums whitespace-nowrap">{m.pieces || 0}</td>
                      <td className="px-6 py-3 text-muted whitespace-nowrap">{reference(m)}</td>
                      <td className="px-6 py-3 text-muted capitalize">{m.note || '—'}</td>
                      <td className="px-6 py-3 text-muted whitespace-nowrap">{m.actor || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border-t border-line px-6 py-3 text-xs text-muted shrink-0">
        Complete ledger for this product — every receipt, removal, and stock check, with who recorded it.
      </div>
    </>
  )
}

export default ManagerDashboard
