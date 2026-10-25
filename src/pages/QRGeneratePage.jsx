/**
 * QRGeneratePage — generate and print QR labels.
 * Single mode: pick one product → preview + download/print/PDF.
 * Batch mode: pick multiple → generate all → download as PDF.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeCanvas } from 'qrcode.react'
import jsPDF from 'jspdf'
import { productApi } from '../api/productApi'
import { buildProductQrPayload } from '../utils/qrCodeHelpers'
import { useToastContext } from '../context/ToastContext'
import { CATEGORY_COLORS } from '../constants/productCategories'

/* ─── helpers ─────────────────────────────────────────────────── */
const QR_SIZES = { S: 96, M: 148, L: 200 }
const SIZE_LABELS = { S: 'Small', M: 'Medium', L: 'Large' }
/* Export resolution — the canvas is always rendered at this high
   pixel size so downloaded PNGs/PDFs stay sharp when zoomed in.
   The on-screen size is scaled down via CSS only. */
const EXPORT_QR_SIZE = 1024

const CategoryBadge = ({ cat }) => {
  return (
    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-500'}`}>
      {cat}
    </span>
  )
}

/* Single QR card with its own canvas ref so each can download independently */
function QRCard({ product, size, onRemove, isBatch }) {
  const canvasRef = useRef(null)
  const value = buildProductQrPayload(product) ?? product.sku ?? ''
  const px = QR_SIZES[size]

  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `QR-${product.sku ?? product.name}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [product])

  const printLabel = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const win = window.open('', '_blank', 'width=400,height=500')
    if (!win) return
    win.document.write(`
      <html><head><title>QR Label — ${product.name}</title>
      <style>
        body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;}
        .label{border:1px dashed #d1d5db;border-radius:8px;padding:20px;text-align:center;max-width:220px;}
        p{margin:0 0 8px;font-size:14px;font-weight:600;color:#0A0A0A;}
        span{font-size:11px;color:#6b7280;display:block;margin-bottom:12px;}
        img{max-width:100%;display:block;margin:0 auto;}
      </style></head>
      <body><div class="label">
        <p>${product.name}</p>
        <span>${product.sku ?? ''}</span>
        <img src="${dataUrl}" />
      </div></body></html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }, [product])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="relative bg-card border border-line rounded-2xl shadow-soft overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {isBatch && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-gray-100 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-gray-400 transition-colors"
          title="Remove"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Visual QR */}
      <div className="flex items-center justify-center pt-6 pb-4 bg-gray-50/60">
        <QRCodeCanvas
          id={`qr-canvas-${product.id}`}
          ref={canvasRef}
          value={value}
          size={EXPORT_QR_SIZE}
          level="H"
          includeMargin
          bgColor="#ffffff"
          fgColor="#0A0A0A"
          style={{ width: px, height: px }}
        />
      </div>

      {/* Product info */}
      <div className="px-4 py-3 border-t border-line">
        <p className="text-sm font-semibold text-ink truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400 font-mono">{product.sku}</span>
          <CategoryBadge cat={product.category} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 px-4 pb-4">
        <button
          onClick={downloadPng}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-ink bg-page hover:bg-brand-700 hover:text-white px-3 py-2 rounded-full transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
          title="Download PNG"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          PNG
        </button>
        <button
          onClick={printLabel}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-ink bg-page hover:bg-ink hover:text-white px-3 py-2 rounded-full transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
          title="Print label"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" rx="1" />
          </svg>
          Print
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Main Page ────────────────────────────────────────────────── */
export default function QRGeneratePage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('single') // 'single' | 'batch'
  const [selected, setSelected] = useState([]) // array of product objects
  const [size, setSize] = useState('M')
  const [showPicker, setShowPicker] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const pickerRef = useRef(null)
  const { showToast } = useToastContext()

  /* close picker on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    productApi.list().then((list) => {
      if (!cancelled) {
        setProducts(Array.isArray(list) ? list : [])
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  /* When switching mode, reset selection */
  const switchMode = (m) => {
    setMode(m)
    setSelected([])
    setQuery('')
  }

  const filtered = products.filter((p) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    )
  })

  const isSelectedProduct = (p) => selected.some((s) => s.id === p.id)

  const toggleProduct = (p) => {
    if (mode === 'single') {
      setSelected([p])
      setShowPicker(false)
    } else {
      setSelected((prev) =>
        prev.some((s) => s.id === p.id)
          ? prev.filter((s) => s.id !== p.id)
          : [...prev, p]
      )
    }
  }

  const removeProduct = (id) => setSelected((prev) => prev.filter((s) => s.id !== id))

  /* PDF export for batch */
  const exportBatchPdf = useCallback(async () => {
    if (selected.length === 0) return
    setIsExportingPdf(true)
    try {
      const CARD_W = 80   // mm
      const CARD_H = 90
      const COLS = 2
      const MARGIN = 10
      const GAP = 5

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const pageW = pdf.internal.pageSize.getWidth()

      let col = 0
      let row = 0
      const totalCols = COLS
      const colW = (pageW - MARGIN * 2 - GAP * (totalCols - 1)) / totalCols

      for (let i = 0; i < selected.length; i++) {
        const product = selected[i]
        const canvas = document.getElementById(`qr-canvas-${product.id}`)
        if (!canvas) continue
        const imgData = canvas.toDataURL('image/png')

        const x = MARGIN + col * (colW + GAP)
        const y = MARGIN + row * (CARD_H + GAP)

        /* card outline */
        pdf.setDrawColor(220, 220, 220)
        pdf.setLineWidth(0.3)
        pdf.roundedRect(x, y, colW, CARD_H, 3, 3, 'S')

        /* QR image */
        const qrSize = colW - 16
        const qrX = x + (colW - qrSize) / 2
        pdf.addImage(imgData, 'PNG', qrX, y + 6, qrSize, qrSize)

        /* product name */
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(8)
        pdf.setTextColor(10, 10, 10)
        const nameY = y + 6 + qrSize + 6
        const nameLines = pdf.splitTextToSize(product.name, colW - 6)
        pdf.text(nameLines.slice(0, 2), x + colW / 2, nameY, { align: 'center' })

        /* SKU */
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(6.5)
        pdf.setTextColor(120, 120, 120)
        pdf.text(product.sku ?? '', x + colW / 2, nameY + (nameLines.length > 1 ? 8 : 5), { align: 'center' })

        /* advance grid position */
        col++
        if (col >= totalCols) {
          col = 0
          row++
          /* new page when row overflows */
          const rowsPerPage = Math.floor((pdf.internal.pageSize.getHeight() - MARGIN * 2) / (CARD_H + GAP))
          if (row >= rowsPerPage && i < selected.length - 1) {
            pdf.addPage()
            row = 0
          }
        }
      }

      pdf.save(`QR-Labels-Batch-${selected.length}.pdf`)
      showToast(`Exported ${selected.length} QR labels as PDF`, 'success')
    } catch (err) {
      console.error('PDF export error:', err)
      showToast('PDF export failed. Try downloading PNGs individually.', 'error')
    } finally {
      setIsExportingPdf(false)
    }
  }, [selected, showToast])

  /* ─── render ─────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <span className="inline-block text-xs font-medium uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
            QR Labels
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">Generate QR Codes</h1>
          <p className="text-sm text-muted mt-1">Pick products, choose a size, download or print labels.</p>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-page rounded-2xl p-1 self-start sm:self-end">
          {['single', 'batch'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                mode === m ? 'bg-white text-ink shadow-sm' : 'text-gray-400 hover:text-ink'
              }`}
            >
              {m === 'single' ? 'Single' : 'Batch'}
            </button>
          ))}
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Product picker trigger */}
        <div className="relative flex-1 min-w-[220px]" ref={pickerRef}>
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="h-11 w-full flex items-center gap-2 bg-white border border-line hover:border-brand-500 text-left px-4 rounded-lg text-sm text-ink transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            {mode === 'single' && selected.length === 1
              ? <span className="text-ink font-medium">{selected[0].name}</span>
              : mode === 'batch' && selected.length > 0
                ? <span className="text-ink font-medium">{selected.length} product{selected.length > 1 ? 's' : ''} selected</span>
                : <span className="text-gray-400">Search products…</span>
            }
            <svg className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${showPicker ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute z-30 top-full mt-1.5 left-0 right-0 bg-card border border-line rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Search input inside dropdown */}
                <div className="p-2 border-b border-line">
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type to search by name, SKU…"
                    className="w-full text-sm px-3 py-2 rounded-lg bg-page text-ink placeholder:text-muted/55 outline-none focus:outline focus:outline-2 focus:outline-brand-500/25"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                  {isLoading ? (
                    <div className="py-8 text-center text-sm text-gray-400">Loading products…</div>
                  ) : filtered.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">No products match.</div>
                  ) : (
                    filtered.map((p) => {
                      const active = isSelectedProduct(p)
                      return (
                        <button
                          key={p.id}
                          onClick={() => toggleProduct(p)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-page transition-colors ${active ? 'bg-brand-50' : ''}`}
                        >
                          <span className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-colors ${active ? 'bg-brand-700 border-brand-700' : 'border-gray-300'}`}>
                            {active && (
                              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-ink truncate">{p.name}</span>
                            <span className="text-xs text-gray-400 font-mono">{p.sku}</span>
                          </span>
                          <CategoryBadge cat={p.category} />
                        </button>
                      )
                    })
                  )}
                </div>
                {mode === 'batch' && selected.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-line flex items-center justify-between">
                    <span className="text-xs text-gray-400">{selected.length} selected</span>
                    <button
                      onClick={() => setShowPicker(false)}
                      className="text-xs font-semibold text-brand-700 hover:underline"
                    >
                      Done
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Size selector */}
        <div className="flex items-center gap-1 bg-page rounded-2xl p-1">
          {Object.keys(QR_SIZES).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                size === s ? 'bg-white text-ink shadow-sm' : 'text-gray-400 hover:text-ink'
              }`}
              title={SIZE_LABELS[s]}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Batch: PDF export */}
        {mode === 'batch' && selected.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={exportBatchPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 disabled:pointer-events-none text-white text-sm font-medium px-5 py-2.5 rounded-full transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
          >
            {isExportingPdf ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="12" y2="12" />
                <line x1="15" y1="15" x2="12" y2="12" />
              </svg>
            )}
            Export PDF {selected.length > 0 && `(${selected.length})`}
          </motion.button>
        )}

        {/* Single: clear selection */}
        {mode === 'single' && selected.length > 0 && (
          <button
            onClick={() => setSelected([])}
            className="text-xs text-gray-400 hover:text-ink transition-colors px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* QR grid / preview */}
      <AnimatePresence mode="popLayout">
        {selected.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-page flex items-center justify-center mb-5">
              <svg className="w-9 h-9 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h.01M18 14h3M14 18v3M17 17h4v4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-500">No product selected</p>
            <p className="text-xs text-gray-400 mt-1">
              {mode === 'single' ? 'Search and pick one product above.' : 'Search and pick multiple products above.'}
            </p>
            <button
              onClick={() => setShowPicker(true)}
              className="mt-5 inline-flex items-center justify-center gap-2 bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-brand-800 transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Select product{mode === 'batch' ? 's' : ''}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            layout
            className={`grid gap-4 ${
              mode === 'single'
                ? 'grid-cols-1 max-w-xs'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'
            }`}
          >
            <AnimatePresence>
              {selected.map((p) => (
                <QRCard
                  key={p.id}
                  product={p}
                  size={size}
                  isBatch={mode === 'batch'}
                  onRemove={() => removeProduct(p.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batch info banner */}
      {mode === 'batch' && selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 bg-brand-50 border border-brand-200 rounded-2xl px-5 py-3.5"
        >
          <svg className="w-4 h-4 text-brand-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
          </svg>
          <p className="text-sm text-brand-700 font-medium">
            <span className="font-bold">{selected.length}</span> QR code{selected.length > 1 ? 's' : ''} ready.
            Use <span className="font-bold">Export PDF</span> to download all labels in one file,
            or download/print each individually.
          </p>
        </motion.div>
      )}
    </div>
  )
}
