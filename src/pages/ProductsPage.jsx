/**
 * ProductsPage — full product catalogue management.
 * Search & category filters, KPI stats bar, Table vs Grid view toggle,
 * instant QR code modal, CSV export, and delete actions.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { productApi } from '../api/productApi'
import { authApi } from '../api/authApi'
import { formatCurrency } from '../utils/formatCurrency'
import { exportToCSV } from '../utils/exportToCSV'
import { exportReportPDF } from '../utils/exportToPDF'
import { exportToXLS } from '../utils/exportSpreadsheet'
import { shopDisplayName, formatDateShort } from '../utils/branding'
import { unitPriceOf } from '../utils/pricing'
import ExportMenu from '../components/common/ExportMenu'
import { RowActionMenu, DockIcons } from '../components/admin/RowActions'
import ConfirmModal from '../components/admin/ConfirmModal'
import MetricCards from '../components/reports/MetricCards'
import { buildProductQrPayload } from '../utils/qrCodeHelpers'
import { useToastContext } from '../context/ToastContext'
import { ROUTE_PATHS } from '../constants/routePaths'
import { PRODUCT_CATEGORIES, CATEGORY_COLORS } from '../constants/productCategories'

/* QR export resolution — canvas renders at high pixel size so
   downloaded/printed PNGs stay sharp when zoomed; CSS scales it
   down for on-screen display only. */
const QR_EXPORT_SIZE = 1024

const PRODUCT_EXPORT_HEADERS = [
  'Product Name',
  'SKU / Barcode',
  'Price per Piece (RWF)',
  'Carton Price',
  'Pieces per Carton',
  'Cartons',
  'Stock on Hand',
]

const productHasHistory = (p) => Boolean(p?.hasHistory || (Number(p?.movementCount) || 0) > 0)

const KPI_ICONS = {
  skus: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12',
  value: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  low: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  out: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM15 9l-6 6M9 9l6 6',
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const { showToast } = useToastContext()
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [stockFilter, setStockFilter] = useState('all') // 'all' | 'low' | 'out' | 'in'
  const [sortBy, setSortBy] = useState('name-asc')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'

  // Modal states
  const [qrModalProduct, setQrModalProduct] = useState(null)
  const [viewProduct, setViewProduct] = useState(null) // read-only detail popup
  const [deleteProductTarget, setDeleteProductTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editPiecePrice, setEditPiecePrice] = useState(null) // { productId, piecePrice }
  const [isSavingPrice, setIsSavingPrice] = useState(false)
  const [verifyingAll, setVerifyingAll] = useState(false)
  const [verifyTarget, setVerifyTarget] = useState(null) // product awaiting confirm before verify
  const [verifyAllOpen, setVerifyAllOpen] = useState(false)

  // Load products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await productApi.list()
      setProducts(Array.isArray(list) ? list : [])
    } catch {
      showToast('Could not load products', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Live session identity for branded export headers
  useEffect(() => {
    authApi
      .getCurrentUser()
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [])

  // KPIs
  const stats = useMemo(() => {
    const totalCount = products.length
    const totalValuation = products.reduce(
      (sum, p) => sum + (Number(p.quantity) || 0) * (Number(p.price) || 0),
      0
    )
    const lowStockCount = products.filter(
      (p) => Number(p.quantity) <= Number(p.reorderLevel || 0) && Number(p.quantity) > 0
    ).length
    const outOfStockCount = products.filter((p) => Number(p.quantity) === 0).length
    const totalUnits = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0)

    return { totalCount, totalValuation, lowStockCount, outOfStockCount, totalUnits }
  }, [products])

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...products]

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      )
    }

    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory)
    }

    if (stockFilter === 'low') {
      list = list.filter(
        (p) => Number(p.quantity) <= Number(p.reorderLevel || 0) && Number(p.quantity) > 0
      )
    } else if (stockFilter === 'out') {
      list = list.filter((p) => Number(p.quantity) === 0)
    } else if (stockFilter === 'in') {
      list = list.filter((p) => Number(p.quantity) > Number(p.reorderLevel || 0))
    }

    list.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name)
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0)
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0)
      if (sortBy === 'qty-asc') return (a.quantity || 0) - (b.quantity || 0)
      if (sortBy === 'qty-desc') return (b.quantity || 0) - (a.quantity || 0)
      return 0
    })

    return list
  }, [products, search, selectedCategory, stockFilter, sortBy])

  // Read-only detail for the product popup
  const detail = viewProduct
    ? (() => {
        const qty = Number(viewProduct.quantity) || 0
        const reorder = Number(viewProduct.reorderLevel) || 10
        const ppc = Number(viewProduct.piecesPerCarton) || 1
        return {
          qty,
          ppc,
          reorder,
          opened: ppc > 1 ? qty % ppc : 0,
          cartons: ppc > 1 ? Math.floor(qty / ppc) : 0,
          isOut: qty === 0,
          isLow: qty <= reorder && qty > 0,
          piece: unitPriceOf(viewProduct),
        }
      })()
    : null

  // Delete product
  const handleDeleteConfirm = async () => {
    if (!deleteProductTarget) return
    setIsDeleting(true)
    try {
      await productApi.remove(deleteProductTarget.id)
      setProducts((prev) => prev.filter((p) => p.id !== deleteProductTarget.id))
      showToast(`Product "${deleteProductTarget.name}" deleted`, 'success')
      setDeleteProductTarget(null)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not delete product', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Save piece price (auto-updates carton price)
  const handleSavePiecePrice = async () => {
    if (!editPiecePrice || !viewProduct) return
    setIsSavingPrice(true)
    try {
      const piecePrice = Math.max(0, Math.round(Number(editPiecePrice.piecePrice) || 0))
      const ppc = Number(viewProduct.piecesPerCarton) || 1
      const cartonPrice = piecePrice * ppc
      await productApi.update(viewProduct.id, { unitPrice: piecePrice, price: cartonPrice })
      setProducts((prev) =>
        prev.map((p) =>
          p.id === viewProduct.id
            ? { ...p, unitPrice: piecePrice, price: cartonPrice, priceApproved: true }
            : p
        )
      )
      showToast('Prices updated', 'success')
      setEditPiecePrice(null)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not update prices', 'error')
    } finally {
      setIsSavingPrice(false)
    }
  }

  // Verify / unverify a product (PENDING → VERIFIED). Only VERIFIED products can be sold.
  const isPending = (p) => (p.status || 'PENDING') === 'PENDING'

  // Verify is flagged for confirmation first — once verified the product is sellable.
  const handleVerify = (p) => setVerifyTarget(p)

  const runVerify = async (target) => {
    try {
      const updated = await productApi.verify(target.id)
      const np = updated && typeof updated === 'object' ? updated : { status: 'VERIFIED', verifiedAt: new Date().toISOString() }
      setProducts((prev) => prev.map((pr) => (pr.id === target.id ? { ...pr, ...np } : pr)))
      setViewProduct((v) => (v && v.id === target.id ? { ...v, ...np } : v))
      showToast(`"${target.name}" verified — it can now be sold`, 'success')
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Could not verify product', 'error')
    } finally {
      setVerifyTarget(null)
    }
  }

  const handleUnverify = async (p) => {
    try {
      const updated = await productApi.unverify(p.id)
      const np = updated && typeof updated === 'object' ? updated : { status: 'PENDING', verifiedAt: null }
      setProducts((prev) => prev.map((pr) => (pr.id === p.id ? { ...pr, ...np } : pr)))
      setViewProduct((v) => (v && v.id === p.id ? { ...v, ...np } : v))
      showToast(`"${p.name}" is now PENDING — it can't be sold until verified again`, 'success')
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Could not update product status', 'error')
    }
  }

  const pendingCount = useMemo(() => products.filter((p) => isPending(p)).length, [products])

  // Verify-all is also gated behind a warning first.
  const handleVerifyAll = () => setVerifyAllOpen(true)

  const runVerifyAll = async () => {
    setVerifyingAll(true)
    try {
      const res = await productApi.verifyAll()
      const n = Number(res?.verified ?? 0)
      await fetchProducts()
      showToast(
        n > 0 ? `Verified ${n} product${n === 1 ? '' : 's'} — they can now be sold` : 'No pending products to verify',
        n > 0 ? 'success' : 'info'
      )
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Could not verify products', 'error')
    } finally {
      setVerifyingAll(false)
      setVerifyAllOpen(false)
    }
  }

  // Close modals with the Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setQrModalProduct(null)
        setViewProduct(null)
        setDeleteProductTarget(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Export helpers (branded Excel / PDF / raw CSV)
  const productExportSpec = useCallback(() => {
    const visible = filteredProducts
    return {
      reportTitle: 'Product Catalogue & Stock Sheet',
      subtitle: `${visible.length} product${visible.length > 1 ? 's' : ''} matching the current filters (${selectedCategory === 'All' ? 'all categories' : selectedCategory}).`,
      periodLabel: `As of ${formatDateShort(new Date())}`,
      generatedBy: profile?.name || 'Shop Manager',
      shopName: shopDisplayName(profile),
      headers: [...PRODUCT_EXPORT_HEADERS],
      rows: visible.map((p) => {
        const ppc = Math.max(1, Number(p.piecesPerCarton) || 1)
        const units = Number(p.quantity) || 0
        return [
          p.name,
          p.sku,
          unitPriceOf(p),
          p.price,
          ppc,
          Math.floor(units / ppc),
          units,
        ]
      }),
      photos: visible.map((p) => p.photo || null),
      alignments: ['left', 'left', 'right', 'right', 'right', 'right', 'right'],
      totalsRow: [
        'TOTAL',
        '',
        '',
        '',
        '',
        Math.round(visible.reduce((s, p) => s + Math.floor((Number(p.quantity) || 0) / Math.max(1, Number(p.piecesPerCarton) || 1)), 0)),
        Math.round(visible.reduce((s, p) => s + (Number(p.quantity) || 0), 0)),
      ],
      filename: `StockRwa-Products-${new Date().toISOString().slice(0, 10)}`,
    }
  }, [filteredProducts, selectedCategory, profile])

  const handleExportExcel = useCallback(async () => {
    try {
      await exportToXLS(productExportSpec())
      showToast('Products exported as branded Excel', 'success')
    } catch (err) {
      showToast(err?.message || 'Excel export failed', 'error')
    }
  }, [productExportSpec, showToast])

  const handleExportPDF = useCallback(async () => {
    try {
      await exportReportPDF(productExportSpec())
      showToast('Products exported as PDF report', 'success')
    } catch (err) {
      showToast(err?.message || 'PDF export failed', 'error')
    }
  }, [productExportSpec, showToast])

  const handleExportCSV = () => {
    try {
      exportToCSV(PRODUCT_EXPORT_HEADERS, productExportSpec().rows, `StockRwa-Products-${new Date().toISOString().slice(0, 10)}`, {
        totalsRow: productExportSpec().totalsRow,
      })
      showToast('Products exported as raw CSV', 'success')
    } catch (err) {
      showToast(err?.message || 'CSV export failed', 'error')
    }
  }

  // Single print label
  const handlePrintLabel = (product) => {
    const canvas = document.getElementById(`modal-qr-${product.id}`)
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const win = window.open('', '_blank', 'width=400,height=500')
    if (!win) return
    win.document.write(`
      <html><head><title>QR Label — ${product.name}</title>
      <style>
        body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;}
        .label{border:1px dashed #d1d5db;border-radius:8px;padding:20px;text-align:center;max-width:220px;}
        p{margin:0 0 6px;font-size:14px;font-weight:700;color:#0A0A0A;}
        span{font-size:11px;color:#6b7280;display:block;margin-bottom:12px;font-family:monospace;}
        img{max-width:100%;display:block;margin:0 auto;}
        .price{margin-top:10px;font-size:13px;font-weight:700;color:#0b5f32;}
      </style></head>
      <body><div class="label">
        <p>${product.name}</p>
        <span>${product.sku}</span>
        <img src="${dataUrl}" />
        <div class="price">${formatCurrency(product.price)}</div>
      </div></body></html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="inline-block text-xs font-medium uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
            Inventory Catalog
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">
            Products & SKUs
          </h1>
          <p className="text-sm text-muted mt-1">
            Browse, search, edit products, and print QR shelf labels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export button */}
          <ExportMenu onExcel={handleExportExcel} onPdf={handleExportPDF} onCsv={handleExportCSV} />

          {/* QR Generator Link */}
          <Link
            to={ROUTE_PATHS.QR_GENERATE}
            className="inline-flex items-center justify-center gap-1.5 bg-white border border-line hover:bg-page text-ink text-sm font-medium px-4 py-2.5 rounded-full transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h.01M18 14h3M14 18v3M17 17h4v4" />
            </svg>
            Generate QR Labels
          </Link>

          {/* Add Product Button */}
          <Link
            to={ROUTE_PATHS.PRODUCT_ADD}
            className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2.5 rounded-full transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* KPI row — same famous cards as the system reports: first black accent + green */}
      <MetricCards
        items={[
          { label: 'Active SKUs', value: stats.totalCount, sub: `${stats.totalUnits} units on stock`, icon: KPI_ICONS.skus, accent: true },
          { label: 'Inventory Value', value: formatCurrency(stats.totalValuation), sub: 'Asset valuation', icon: KPI_ICONS.value },
          { label: 'Low Stock Warnings', value: stats.lowStockCount, sub: 'At or below reorder level', icon: KPI_ICONS.low },
          { label: 'Out of Stock', value: stats.outOfStockCount, sub: 'Require urgent supply', icon: KPI_ICONS.out },
        ]}
      />

      {/* Pending-verification banner — stock can't be sold until products are verified */}
      {pendingCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3.5">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-800">
                {pendingCount} product{pendingCount === 1 ? '' : 's'} not verified yet
              </p>
              <p className="text-xs text-red-700/80 mt-0.5">
                They can't be sold (stock out) until you verify them — individually or all at once.
              </p>
            </div>
          </div>
          <button
            onClick={handleVerifyAll}
            disabled={verifyingAll}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {verifyingAll ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" />
              </svg>
            )}
            Verify all {pendingCount}
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-line bg-card shadow-soft p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, SKU, or category…"
              className="h-11 w-full rounded-lg border border-line bg-white text-sm text-ink placeholder:text-muted/55 pl-10 pr-8 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-11 rounded-lg border border-line bg-white text-sm text-ink px-3.5 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors"
          >
            <option value="All">All Categories</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Stock Filter Selector */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-11 rounded-lg border border-line bg-white text-sm text-ink px-3.5 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in">In Stock (Healthy)</option>
            <option value="low">Low Stock Alerts</option>
            <option value="out">Out of Stock</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-11 rounded-lg border border-line bg-white text-sm text-ink px-3.5 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors"
          >
            <option value="name-asc">Name (A → Z)</option>
            <option value="name-desc">Name (Z → A)</option>
            <option value="price-asc">Price (Lowest first)</option>
            <option value="price-desc">Price (Highest first)</option>
            <option value="qty-desc">Quantity (Highest first)</option>
            <option value="qty-asc">Quantity (Lowest first)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-page rounded-xl p-1 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-ink shadow-sm' : 'text-gray-400 hover:text-ink'
              }`}
              title="Table View"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-ink shadow-sm' : 'text-gray-400 hover:text-ink'
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-gray-200/60" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-line bg-card shadow-soft p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-300">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-ink">No products found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            No inventory items matched your active search query or filters.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => {
                setSearch('')
                setSelectedCategory('All')
                setStockFilter('all')
              }}
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-ink bg-white border border-line hover:bg-page px-4 py-2.5 rounded-full transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
            >
              Clear filters
            </button>
            <Link
              to={ROUTE_PATHS.PRODUCT_ADD}
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-brand-700 hover:bg-brand-800 px-4 py-2.5 rounded-full transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
            >
              + Add Product
            </Link>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-page text-muted font-semibold border-b border-line text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5 whitespace-nowrap w-40">Actions</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Product</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">SKU / Code</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Category</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Carton Price (RWF)</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Piece Price (RWF)</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Stock Level</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Opened Carton</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredProducts.map((p) => {
                  const qty = Number(p.quantity) || 0
                  const reorder = Number(p.reorderLevel) || 10
                  const isOut = qty === 0
                  const isLow = qty <= reorder && !isOut
                  const ppc = Number(p.piecesPerCarton) || 1
                  const openedPcs = ppc > 1 ? qty % ppc : 0

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setViewProduct(p)}
                      className="cursor-pointer hover:bg-gray-50/70 transition-colors"
                      title="Click to view product details"
                    >
                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex justify-start" onClick={(e) => e.stopPropagation()}>
                          <RowActionMenu
                            primary={{ label: 'View Product', icon: DockIcons.eye, onClick: () => setViewProduct(p) }}
                            items={[
                              { label: 'Print QR Code', icon: DockIcons.qr, iconTone: 'text-emerald-600', onClick: () => setQrModalProduct(p) },
{
                                      label: isPending(p) ? 'Edit & Complete' : 'Update Details & Prices',
                                      icon: DockIcons.edit,
                                      onClick: () => navigate(ROUTE_PATHS.PRODUCT_EDIT(p.id)),
                                    },
                                  isPending(p)
                                    ? {
                                        label: 'Verify',
                                        icon: DockIcons.check,
                                        iconTone: 'text-emerald-600',
                                        onClick: () => handleVerify(p),
                                      }
                                    : {
                                        label: 'Unverify',
                                        icon: DockIcons.x,
                                        iconTone: 'text-gray-500',
                                        onClick: () => handleUnverify(p),
                                      },
                                  'divider',
                              { label: 'Delete', icon: DockIcons.trash, danger: true, onClick: () => setDeleteProductTarget(p) },
                            ]}
                          />
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-3.5 max-w-[320px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-page border border-line overflow-hidden flex items-center justify-center shrink-0">
                            {p.photo ? (
                              <img src={p.photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-gray-300 font-semibold">{p.name?.charAt(0) || '?'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-ink truncate whitespace-nowrap">{p.name}</div>
                            {p.unit && <span className="text-xs text-gray-400 font-normal whitespace-nowrap">per {p.unit}</span>}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-3.5 font-mono text-gray-500 font-medium whitespace-nowrap">
                        {p.sku || p.code || '—'}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            CATEGORY_COLORS[p.category] || 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {p.category || 'General'}
                        </span>
                      </td>

                      {/* Carton Price */}
                      <td className="px-6 py-3.5 font-bold text-ink tabular-nums whitespace-nowrap">
                        {formatCurrency(p.price)}
                      </td>

                      {/* Piece Price */}
                      <td className="px-6 py-3.5 font-semibold text-ink tabular-nums whitespace-nowrap">
                        {formatCurrency(unitPriceOf(p))}
                      </td>

                      {/* Stock Level (redesigned: number + neat indicator) */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span className="font-semibold text-ink tabular-nums">{qty}</span>
                        </div>
                      </td>

                      {/* Opened Carton */}
                      <td className="px-6 py-3.5">
                        {ppc > 1 && openedPcs > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
                            </svg>
                            Opened · {openedPcs} left
                          </span>
                        ) : ppc > 1 && qty > 0 ? (
                          <span className="text-xs text-gray-400">Sealed</span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        <div className="flex flex-col items-start gap-1.5 whitespace-nowrap">
                          {isPending(p) && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Not verified
                            </span>
                          )}
                        {p.priceApproved === false ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pending price
                          </span>
                        ) : isOut ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Out of stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Low stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In stock
                          </span>
                        )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const qty = Number(p.quantity) || 0
            const reorder = Number(p.reorderLevel) || 10
            const isOut = qty === 0
            const isLow = qty <= reorder && !isOut
            const ppc = Number(p.piecesPerCarton) || 1
            const openedPcs = ppc > 1 ? qty % ppc : 0

            return (
              <div
                key={p.id}
                onClick={() => setViewProduct(p)}
                className="rounded-2xl border border-line bg-card shadow-soft hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer"
                title="Click to view product details"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        CATEGORY_COLORS[p.category] || 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {p.category}
                    </span>
                    {isPending(p) ? (
                      <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                        Not verified
                      </span>
                    ) : p.priceApproved === false ? (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Pending price
                      </span>
                    ) : isOut ? (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        Out
                      </span>
                    ) : isLow ? (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Low
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        In stock
                      </span>
                    )}
                  </div>

                  <div className="w-12 h-12 rounded-xl border border-line overflow-hidden bg-page flex items-center justify-center mb-3 shrink-0">
                    {p.photo ? (
                      <img src={p.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-gray-300 font-semibold">{p.name?.charAt(0) || '?'}</span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-ink truncate">{p.name}</h3>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{p.sku}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {Number(p.piecesPerCarton) || 1} {p.unit || 'pcs'} per carton
                  </p>
                  {openedPcs > 0 && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
                      </svg>
                      Opened carton · {openedPcs} left
                    </span>
                  )}

                  <div className="mt-4 pt-3 border-t border-line grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-xs text-gray-400 block">Carton</span>
                      <span className="font-bold text-ink text-sm tabular-nums">
                        {formatCurrency(p.price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Piece</span>
                      <span className="font-bold text-ink text-sm tabular-nums">
                        {formatCurrency(unitPriceOf(p))}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">Stock</span>
                      <span className="font-bold text-ink tabular-nums">{qty}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setQrModalProduct(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 py-2.5 rounded-full transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
                  >
                    QR Code
                  </button>
                  {productHasHistory(p) ? (
                    <span
                      className="flex items-center justify-center p-2 text-gray-300 cursor-not-allowed"
                      title="This product has stock history and appears in your reports — it cannot be deleted."
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                  ) : (
                    <button
                      onClick={() => setDeleteProductTarget(p)}
                      className="text-gray-400 hover:text-rose-600 p-2 rounded-full hover:bg-rose-50 transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
                      title="Delete product"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* PRODUCT DETAIL POPUP (read-only, landscape on desktop / stacked on phones) */}
      {viewProduct &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-ink/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={() => setViewProduct(null)}
            role="presentation"
          >
            <div
              className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-card rounded-3xl border border-line shadow-[0_20px_60px_rgba(27,30,38,0.35)] animate-[zoomIn_0.2s_ease]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button
                aria-label="Close"
                onClick={() => setViewProduct(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-white/90 shadow-sm text-ink/40 hover:text-ink hover:bg-page transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Photo panel — left in landscape: desktop/tablet; top on phones */}
                <div className="md:w-[300px] md:min-h-[440px] md:shrink-0 bg-page/70 border-b md:border-b-0 md:border-r border-line">
                  {viewProduct.photo ? (
                    <img
                      src={viewProduct.photo}
                      alt={viewProduct.name}
                      className="w-full h-56 md:h-[300px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-56 md:h-[300px] flex items-center justify-center text-gray-300">
                      <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                  <div className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        detail.isOut
                          ? 'bg-rose-50 text-rose-700'
                          : detail.isLow
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          detail.isOut ? 'bg-rose-500' : detail.isLow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                      {detail.isOut ? 'Out of stock' : detail.isLow ? 'Low stock' : 'In stock'}
                    </span>
                    {viewProduct.priceApproved === false && (
                      <span className="inline-flex items-center gap-1 mt-2 w-fit text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 8v5M12 17h.01" strokeLinecap="round" />
                        </svg>
                        Pending price — set it below
                      </span>
                    )}
                    {isPending(viewProduct) && (
                      <span className="inline-flex items-center gap-1 mt-2 w-fit text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M12 9v4M12 17h.01" />
                        </svg>
                        Not verified — can't be sold yet
                      </span>
                    )}
                    {detail.opened > 0 && (
                      <span className="inline-flex items-center gap-1 mt-2 w-fit text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
                        </svg>
                        Opened carton · {detail.opened} pcs left
                      </span>
                    )}
                  </div>
                </div>

                {/* Info panel — right side in landscape: desktop/tablet; below photo on phones */}
                <div className="flex-1 p-5 sm:p-7 space-y-6">
                  <div>
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
                      {viewProduct.category || 'General'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mt-2">{viewProduct.name}</h3>
                    <p className="text-sm font-mono text-gray-400 mt-1">{viewProduct.sku || viewProduct.code}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-line bg-white p-3.5">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Carton Price</span>
                      {editPiecePrice && editPiecePrice.productId === viewProduct.id ? (
                        <>
                          <span className="block font-bold text-brand-700 text-sm mt-0.5 tabular-nums">{formatCurrency(Number(editPiecePrice.piecePrice) * detail.ppc)}</span>
                          <span className="block text-[10px] text-gray-500 mt-0.5">(auto-calculated)</span>
                        </>
                      ) : (
                        <span className="block font-bold text-ink text-sm mt-0.5 tabular-nums">{formatCurrency(viewProduct.price)}</span>
                      )}
                    </div>
                    <div className="rounded-2xl border border-line bg-white p-3.5">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Piece Price</span>
                      {editPiecePrice && editPiecePrice.productId === viewProduct.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={editPiecePrice.piecePrice}
                            onChange={(e) => setEditPiecePrice({ ...editPiecePrice, piecePrice: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 tabular-nums"
                            placeholder="0"
                            autoFocus
                          />
                          <span className="text-sm text-gray-400">RWF</span>
                        </div>
                      ) : (
                        <span className="block font-bold text-ink text-sm mt-0.5 tabular-nums">{formatCurrency(detail.piece)}</span>
                      )}
                    </div>
                    <div className="rounded-2xl border border-line bg-white p-3.5">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Pieces / Carton</span>
                      <span className="block font-bold text-ink text-sm mt-0.5 tabular-nums">
                        {detail.ppc} {viewProduct.unit || 'pcs'}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-line bg-white p-3.5">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Cartons in Stock</span>
                      <span className="block font-bold text-ink text-sm mt-0.5 tabular-nums">
                        {detail.cartons} {detail.ppc > 1 ? 'cartons' : '—'}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-line bg-white p-3.5">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">In Stock</span>
                      <span className="block font-bold text-ink text-sm mt-0.5 tabular-nums">
                        {detail.qty} {viewProduct.unit || 'pcs'}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-line bg-white p-3.5">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Low Stock Alert</span>
                      <span className="block font-bold text-ink text-sm mt-0.5 tabular-nums">{detail.reorder}</span>
                    </div>
                    <div className="rounded-2xl border border-line bg-white p-3.5">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Opened Carton</span>
                      <span className="block font-bold text-sm mt-0.5 tabular-nums">
                        {detail.ppc > 1
                          ? detail.opened > 0
                            ? `${detail.opened} pcs left`
                            : detail.qty > 0
                            ? 'Sealed'
                            : '—'
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {editPiecePrice && editPiecePrice.productId === viewProduct.id && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleSavePiecePrice}
                        disabled={isSavingPrice}
                        className="px-3 py-1.5 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
                      >
                        {isSavingPrice ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditPiecePrice(null)}
                        className="px-3 py-1.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {!editPiecePrice && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <button
                        onClick={() => setEditPiecePrice({ productId: viewProduct.id, piecePrice: detail.piece })}
                        className="px-3 py-1.5 text-sm font-semibold text-brand-700 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
                      >
                        Edit Piece Price
                      </button>
                      <button
                        onClick={() => (isPending(viewProduct) ? handleVerify(viewProduct) : handleUnverify(viewProduct))}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                          isPending(viewProduct)
                            ? 'text-white bg-emerald-600 hover:bg-emerald-700'
                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {isPending(viewProduct) ? 'Verify Product ✓' : 'Unverify'}
                      </button>
                      <button
                        onClick={() => {
                          const q = viewProduct
                          setViewProduct(null)
                          navigate(ROUTE_PATHS.PRODUCT_EDIT(q.id))
                        }}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                          isPending(viewProduct)
                            ? 'text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100'
                            : 'text-brand-700 bg-brand-50 hover:bg-brand-100'
                        }`}
                      >
                        {isPending(viewProduct) ? 'Edit & Complete…' : 'Update Details & Prices…'}
                      </button>
                    </div>
                  )}

                  {viewProduct.description ? (
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Notes</span>
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{viewProduct.description}</p>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line">
                    <p className="text-xs text-gray-400">
                      Added on{' '}
                      {viewProduct.createdAt ? formatDateShort(new Date(viewProduct.createdAt)) : '—'}
                    </p>
                    <button
                      onClick={() => {
                        const q = viewProduct
                        setViewProduct(null)
                        setQrModalProduct(q)
                      }}
                      className="text-sm font-semibold text-brand-700 hover:underline"
                    >
                      Print QR label →
                    </button>
                  </div>

                  <p className="text-xs text-gray-400">
                    Read-only preview — quantities change only through Stock In / Stock Out.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* QR MODAL */}
      {qrModalProduct &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto bg-ink/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={() => setQrModalProduct(null)}
            role="presentation"
          >
            <div
              className="relative w-full max-w-sm bg-card rounded-3xl border border-line shadow-[0_20px_60px_rgba(27,30,38,0.25)] p-6 text-center animate-[zoomIn_0.2s_ease]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button
                aria-label="Close"
                onClick={() => setQrModalProduct(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-ink/40 hover:text-ink hover:bg-page transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>

              <span className="inline-block text-xs font-bold uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
                Product QR Label
              </span>

              <h3 className="text-lg font-bold tracking-tight text-ink mt-3 truncate">{qrModalProduct.name}</h3>
              <p className="text-xs font-mono text-gray-400 mt-0.5">{qrModalProduct.sku}</p>

              {/* Shelf label preview card */}
              <div className="mt-5 mx-auto w-full max-w-[248px] rounded-2xl bg-white border border-line shadow-[0_16px_40px_rgba(15,118,110,0.1)] overflow-hidden">
                <div className="bg-brand-50 px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-700">StockRwa</span>
                  <span className="text-xs font-mono uppercase text-gray-400">{qrModalProduct.category || 'General'}</span>
                </div>

                <div className="px-5 py-4">
                  <div className="flex items-center justify-center">
                    <QRCodeCanvas
                      id={`modal-qr-${qrModalProduct.id}`}
                      value={buildProductQrPayload(qrModalProduct)}
                      size={QR_EXPORT_SIZE}
                      level="H"
                      includeMargin
                      bgColor="#ffffff"
                      fgColor="#0A0A0A"
                      style={{ width: 180, height: 180 }}
                    />
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div className="text-left">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Price</span>
                    <span className="font-extrabold text-brand-700 text-sm tabular-nums">{formatCurrency(qrModalProduct.price)}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">In Stock</span>
                    <span className="font-extrabold text-ink text-sm tabular-nums">
                      {Number(qrModalProduct.quantity) || 0} {qrModalProduct.unit || 'pcs'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                Pin this label at the shelf — staff scan it to verify or restock.
              </p>

              <div className="flex items-center gap-2.5 mt-5">
                <button
                  onClick={() => {
                    const canvas = document.getElementById(`modal-qr-${qrModalProduct.id}`)
                    if (canvas) {
                      const link = document.createElement('a')
                      link.download = `QR-${qrModalProduct.sku}.png`
                      link.href = canvas.toDataURL('image/png')
                      link.click()
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium bg-white border border-line hover:bg-page text-ink py-3 rounded-full transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download PNG
                </button>
                <button
                  onClick={() => handlePrintLabel(qrModalProduct)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium bg-brand-700 hover:bg-brand-800 text-white py-3 rounded-full transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <path d="M6 14h12v8H6z" />
                  </svg>
                  Print Label
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteProductTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={isDeleting ? undefined : () => setDeleteProductTarget(null)}
            role="presentation"
          >
            <div
              className="relative w-full max-w-[440px] bg-card rounded-3xl border border-line shadow-[0_20px_60px_rgba(27,30,38,0.25)] p-6 sm:p-7 animate-[zoomIn_0.2s_ease]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-ink tracking-tight">Delete product</h3>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                {productHasHistory(deleteProductTarget) ? (
                  <>
                    This product is in your reports — it can't be deleted.
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently remove{' '}
                    <span className="font-semibold text-ink">"{deleteProductTarget.name}"</span> from the active
                    catalogue?
                  </>
                )}
              </p>

              <div className="pt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeleteProductTarget(null)}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-ink border border-line hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                >
                  Cancel
                </button>
                {!productHasHistory(deleteProductTarget) && (
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium bg-danger-600 text-white hover:bg-danger-700 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {isDeleting && <span className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* VERIFY CONFIRMATION — single product */}
      <ConfirmModal
        open={Boolean(verifyTarget)}
        title={`Verify "${verifyTarget?.name || ''}"?`}
        message={`Once verified, this product is sellable — staff can take it out as stock for customers. You can unverify it later if anything changes. Continue?`}
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4 12 14.01l-3-3" />
          </svg>
        }
        iconChip="bg-emerald-50 text-emerald-600"
        confirmLabel="Yes, verify"
        cancelLabel="No, keep pending"
        tone="green"
        onCancel={() => setVerifyTarget(null)}
        onConfirm={() => runVerify(verifyTarget)}
      />

      {/* VERIFY-ALL CONFIRMATION */}
      <ConfirmModal
        open={verifyAllOpen}
        title={`Verify all ${pendingCount} pending product${pendingCount === 1 ? '' : 's'}?`}
        message="Every pending product becomes verified and sellable at once — each one can be taken out as stock for customers. You can unverify any of them later. Continue?"
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4 12 14.01l-3-3" />
          </svg>
        }
        iconChip="bg-emerald-50 text-emerald-600"
        confirmLabel={verifyingAll ? 'Verifying…' : 'Yes, verify all'}
        cancelLabel="No, keep pending"
        tone="green"
        loading={verifyingAll}
        onCancel={() => setVerifyAllOpen(false)}
        onConfirm={() => runVerifyAll()}
      />
    </div>
  )
}
