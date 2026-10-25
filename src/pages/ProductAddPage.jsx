/**
 * ProductAddPage — create a new product.
 * Features live card and QR preview, validation, and options to immediately
 * print QR labels after saving.
 */
import React, { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeCanvas } from 'qrcode.react'
import ProductForm from '../components/products/ProductForm'
import PricingCalculatorCard from '../components/products/PricingCalculatorCard'
import { productApi } from '../api/productApi'
import { settingsApi } from '../api/settingsApi'
import { buildProductQrPayload } from '../utils/qrCodeHelpers'
import { formatCurrency } from '../utils/formatCurrency'
import { useToastContext } from '../context/ToastContext'
import { ROUTE_PATHS } from '../constants/routePaths'
import { CATEGORY_COLORS } from '../constants/productCategories'

export default function ProductAddPage() {
  const navigate = useNavigate()
  const { showToast } = useToastContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewData, setPreviewData] = useState({
    name: 'Men Leather Shoes',
    sku: 'SHOE-001',
    category: 'Shoes',
    price: 25000,
    quantity: 1,
    reorderLevel: 10,
    piecesPerCarton: 1,
    photo: '',
  })
  const [redirectAfter, setRedirectAfter] = useState('products') // 'products' | 'qr'
  const [applySignal, setApplySignal] = useState({ nonce: 0, value: null })
  const [allowUnpriced, setAllowUnpriced] = useState(false)

  useEffect(() => {
    let mounted = true
    settingsApi
      .getSettings()
      .then((data) => {
        if (mounted) setAllowUnpriced(Boolean(data?.allowUnpricedProducts))
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const handlePreviewChange = useCallback((formData) => {
    setPreviewData((prev) => ({ ...prev, ...formData }))
  }, [])

  const handleCalculatorApply = useCallback((value) => {
    setApplySignal({ nonce: Date.now(), value })
  }, [])

  const handleSubmit = async (values) => {
    setIsSubmitting(true)
    try {
      const created = await productApi.create(values)

      showToast(
        created.priceApproved === false
          ? `Product "${created.name}" saved — awaiting price approval`
          : `Product "${created.name}" created successfully!`,
        'success'
      )

      if (redirectAfter === 'qr') {
        navigate(ROUTE_PATHS.QR_GENERATE)
      } else {
        navigate(ROUTE_PATHS.PRODUCTS)
      }
    } catch (err) {
      console.error('Create product error:', err)
      showToast(err?.response?.data?.message || err.message || 'Failed to create product', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const qrPayload = buildProductQrPayload({
    name: previewData.name || 'Product',
    sku: previewData.sku || 'SKU-000',
    id: 'NEW',
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Breadcrumbs */}
      <div>
        <Link
          to={ROUTE_PATHS.PRODUCTS}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-700 transition-colors mb-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Products Catalog
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <span className="inline-block text-xs font-medium uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
              Catalog Entry
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-2">Add New Product</h1>
            <p className="text-sm text-muted mt-1">
              Add a product with its price, carton size, opening stock, and low-stock alert.
            </p>
          </div>

          {/* Quick toggle for after save */}
          <div className="flex items-center gap-2 bg-page p-1 rounded-2xl text-xs font-medium self-start sm:self-end">
            <button
              type="button"
              onClick={() => setRedirectAfter('products')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                redirectAfter === 'products' ? 'bg-white text-ink shadow-sm font-semibold' : 'text-gray-400'
              }`}
            >
              Return to Catalog
            </button>
            <button
              type="button"
              onClick={() => setRedirectAfter('qr')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                redirectAfter === 'qr' ? 'bg-white text-ink shadow-sm font-semibold' : 'text-gray-400'
              }`}
            >
              Print QR Code Next
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form (2 cols) */}
        <div className="lg:col-span-2">
          <ProductForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => navigate(ROUTE_PATHS.PRODUCTS)}
            onChangePreview={handlePreviewChange}
            externalUnitPrice={applySignal}
            allowUnpriced={allowUnpriced}
            submitLabel={redirectAfter === 'qr' ? 'Save & Print QR Code' : 'Save Product'}
          />
        </div>

        {/* Right Preview Column (1 col) */}
        <div className="space-y-6">
          {/* Live Card Preview */}
          <div className="rounded-2xl border border-line bg-card shadow-soft p-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Live Product Card Preview
            </span>

            <div className="p-4 rounded-xl border border-line bg-white shadow-soft space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-ink truncate">
                    {previewData.name || 'Product Name'}
                  </h4>
                  <span className="font-mono text-xs text-gray-400">
                    {previewData.sku || 'SKU-000'}
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    CATEGORY_COLORS[previewData.category] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {previewData.category || 'General'}
                </span>
              </div>

              <div className="flex items-center justify-center h-32 w-full rounded-lg overflow-hidden bg-page">
                {previewData.photo ? (
                  <img src={previewData.photo} alt="Product" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">No photo added</span>
                )}
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400 block text-xs">Price / Carton</span>
                  <span className="font-bold text-ink text-sm tabular-nums">
                    {formatCurrency(previewData.price || 0)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-xs">Opening Stock</span>
                  <span className="font-semibold text-brand-700 tabular-nums">
                    {previewData.quantity || 0} {previewData.unit || 'pcs'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-xs">Per Carton</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {previewData.piecesPerCarton || 1} {previewData.unit || 'pcs'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live QR Code Preview */}
          <div className="rounded-2xl border border-line bg-card shadow-soft p-5 flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Live Printable QR Label
            </span>

            <div className="p-4 rounded-xl border border-dashed border-gray-300 bg-white text-center w-48">
              <p className="text-xs font-bold text-ink truncate">
                {previewData.name || 'Product Name'}
              </p>
              <p className="text-xs font-mono text-gray-400 mb-2">
                {previewData.sku || 'SKU-000'}
              </p>

              <div className="flex justify-center my-2">
                <QRCodeCanvas
                  value={qrPayload}
                  size={120}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#0A0A0A"
                />
              </div>

              <p className="text-xs font-bold text-brand-700 mt-1">
                {formatCurrency(previewData.price || 0)}
              </p>
            </div>

            <p className="text-xs text-gray-400 mt-3 max-w-xs">
              Scan it with staff devices to move stock fast.
            </p>
          </div>

          {/* Price Calculator */}
          <PricingCalculatorCard onApply={handleCalculatorApply} />
        </div>
      </div>
    </div>
  )
}
