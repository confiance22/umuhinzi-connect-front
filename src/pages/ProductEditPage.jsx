/**
 * ProductEditPage — edit an existing product.
 * Loads the product by :id into ProductForm (edit mode). The shop manager can
 * edit everything — name, prices, SKU, photos, notes and stock on hand — whether
 * the product is VERIFIED or still PENDING. A rename carries through to past
 * reports. Saves via productApi.update.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProductForm from '../components/products/ProductForm'
import PricingCalculatorCard from '../components/products/PricingCalculatorCard'
import { productApi } from '../api/productApi'
import { settingsApi } from '../api/settingsApi'
import { useToastContext } from '../context/ToastContext'
import { ROUTE_PATHS } from '../constants/routePaths'

export default function ProductEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useToastContext()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allowUnpriced, setAllowUnpriced] = useState(false)
  const [applySignal, setApplySignal] = useState({ nonce: 0, value: null })

  const handleCalculatorApply = useCallback((value) => {
    setApplySignal({ nonce: Date.now(), value })
  }, [])

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

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setLoadingError('')
    productApi
      .get(id)
      .then((p) => {
        if (mounted) setProduct(p)
      })
      .catch((err) => {
        if (mounted) setLoadingError(err?.response?.data?.message || err.message || 'Could not load the product')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [id])

  const handleSubmit = async (values) => {
    if (!product) return
    setIsSubmitting(true)
    try {
      const updated = await productApi.update(product.id, values)
      showToast(
        updated.priceApproved === false
          ? `"${updated.name}" saved — awaiting price approval`
          : `"${updated.name}" updated successfully`,
        'success'
      )
      navigate(ROUTE_PATHS.PRODUCTS)
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || 'Could not update the product', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verified = product?.status === 'VERIFIED'

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
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
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-2">
              {product ? `Edit ${product.name}` : 'Edit Product'}
            </h1>
            {product && (
              <p className="text-sm text-muted mt-1">
                {verified
                  ? 'Everything below is editable — a rename updates your reports instantly, and you can correct stock, carton size or unit at any time.'
                  : 'Fix anything you missed at registration — then verify it to start selling. Everything stays editable either way.'}
              </p>
            )}
          </div>
          {product && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${
                verified ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700 border border-red-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${verified ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {verified ? 'Verified' : 'Not verified'}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-48 rounded-2xl bg-gray-200/60" />
          <div className="h-64 rounded-2xl bg-gray-200/60" />
        </div>
      ) : loadingError ? (
        <div className="rounded-2xl border border-line bg-card shadow-soft p-10 text-center">
          <p className="text-sm font-semibold text-ink">Could not load the product</p>
          <p className="text-xs text-gray-400 mt-1">{loadingError}</p>
          <Link
            to={ROUTE_PATHS.PRODUCTS}
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-brand-700 hover:bg-brand-800 px-4 py-2.5 rounded-full mt-5"
          >
            Back to Products
          </Link>
        </div>
      ) : !product ? null : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form (2 cols) */}
          <div className="lg:col-span-2">
            {verified ? (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <p className="text-[13px] font-semibold text-emerald-800 leading-snug">
                  Verified — everything below stays editable, and renaming updates your reports too. Note: setting
                  "Stock on Hand" here overrides the shelf count directly without a movement record — use Stock
                  In / Stock Out for tracked changes.
                </p>
              </div>
            ) : (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
                <p className="text-[13px] font-semibold text-amber-800 leading-snug">
                  Not verified yet — add anything you missed (photo, price, SKU, carton size…), save, then verify
                  the product to unlock selling.
                </p>
              </div>
            )}

            <ProductForm
              initialValues={product}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onCancel={() => navigate(ROUTE_PATHS.PRODUCTS)}
              isEdit
              allowUnpriced={allowUnpriced}
              externalUnitPrice={applySignal}
              submitLabel="Save Changes"
            />
          </div>

          {/* Right Preview Column (1 col) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-card shadow-soft p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Price Helper</span>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Use the calculator to suggest a piece price, then apply it to the form.
              </p>
              <PricingCalculatorCard onApply={handleCalculatorApply} />
              <p className="text-[11px] text-gray-400 mt-3">
                Stock is set the same way as on the Add page: cartons (halves allowed, e.g. 3.5)
                plus leftover pieces found on the side — e.g. 3 cartons × 20 pieces per carton
                + 15 leftover = 75 pieces.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}