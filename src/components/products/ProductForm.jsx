/**
 * ProductForm — full create/edit product form.
 * Fields: name, category, SKU, price per piece (RWF), pieces per carton, starting stock,
 * low-stock alert level, unit, and notes.
 * On add, "Starting Stock" is entered as full CARTONS (opening stock = cartons × pieces
 * per carton, calculated live); on edit it is the on-shelf stock in units.
 * Carton price is auto-calculated from price per piece × pieces per carton.
 * Features live SKU generation and real-time preview sync.
 */
import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { formatCurrency } from '../../utils/formatCurrency'
import { uploadProductPhoto } from '../../utils/cloudinary'

import { PRODUCT_CATEGORIES } from '../../constants/productCategories'

const UNITS = ['pcs', 'pair', 'box', 'set', 'dozen', 'roll', 'pack']

export default function ProductForm({
  initialValues = {},
  onSubmit,
  isSubmitting = false,
  onCancel,
  onChangePreview,
  submitLabel = 'Save Product',
  isEdit = false,
  externalUnitPrice,
  allowUnpriced = false,
}) {
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const FORM_INITIAL_PPC = Math.max(1, Number(initialValues.piecesPerCarton) || 1)
const FORM_INITIAL_QTY = initialValues.quantity != null ? Number(initialValues.quantity) : null

const [formData, setFormData] = useState({
    name: initialValues.name || '',
    category: initialValues.category || 'General',
    sku: initialValues.sku || initialValues.code || '',
    price: initialValues.price ?? '',
    unitPrice: initialValues.unitPrice ?? '',
    quantity:
      initialValues.quantity != null
        ? Math.floor(FORM_INITIAL_QTY / FORM_INITIAL_PPC)
        : (isEdit ? '' : 1),
    loosePieces:
      initialValues.quantity != null
        ? (FORM_INITIAL_QTY % FORM_INITIAL_PPC)
        : (initialValues.loosePieces ?? ''),
    reorderLevel: initialValues.reorderLevel ?? 1,
    unit: initialValues.unit || 'pcs',
    piecesPerCarton: initialValues.piecesPerCarton ?? 1,
    photos:
      initialValues.photos?.length > 0
        ? initialValues.photos.filter(Boolean)
        : initialValues.photo
          ? [initialValues.photo]
          : [],
    photo: initialValues.photos?.length > 0 ? initialValues.photos[0] : initialValues.photo || '',
    description: initialValues.description || '',
  })

  const unitPriceNum = formData.unitPrice === '' ? NaN : Number(formData.unitPrice)
  const piecesNum = formData.piecesPerCarton === '' ? NaN : Number(formData.piecesPerCarton)
  const cartonPriceAuto =
    !isNaN(unitPriceNum) && !isNaN(piecesNum) && piecesNum > 0 ? Math.round(unitPriceNum * piecesNum) : null

  /* The shop manager can edit anything on a product whether it is verified or still
     pending — name, prices, photos, stock on hand (cartons + leftover), pieces per
     carton and unit are all editable. Stock edits here override the shelf count
     directly; the tracked history lives under Stock In / Stock Out. */
  const verified = false

  /* Stock is always entered the same way — on ADD as "Starting Stock", on EDIT as
   "Stock on Hand": full/partial cartons (halves allowed, 3.5 = 3 + half) plus
   leftover pieces found on the side. Opening = cartons × pieces per carton + leftover. */
  const rawCartonsNum = formData.quantity === '' ? NaN : Number(formData.quantity)
  const looseNum = formData.loosePieces === '' ? 0 : Math.max(0, Number(formData.loosePieces) || 0)
  const fullCartons = isNaN(rawCartonsNum) ? NaN : Math.floor(rawCartonsNum)
  const partialPieces =
    !isNaN(rawCartonsNum) && !isNaN(piecesNum) ? Math.round((rawCartonsNum - fullCartons) * piecesNum) : NaN
  const openingUnits =
    !isNaN(fullCartons) && !isNaN(partialPieces) && piecesNum >= 1
      ? fullCartons * piecesNum + partialPieces + looseNum
      : NaN

  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')

  // Notify parent on changes for real-time preview card
  useEffect(() => {
    onChangePreview?.({
      ...formData,
      price: cartonPriceAuto ?? formData.price,
      unitPrice: Number.isFinite(unitPriceNum) ? unitPriceNum : formData.unitPrice,
      quantity: Number.isFinite(openingUnits) ? openingUnits : formData.quantity,
    })
  }, [formData, onChangePreview, cartonPriceAuto, unitPriceNum, openingUnits])

  const generateSku = () => {
    const prefix = (formData.category || 'ITEM').substring(0, 4).toUpperCase()
    const rand = Math.floor(100 + Math.random() * 900)
    const code = `${prefix}-${rand}`
    setFormData((prev) => ({ ...prev, sku: code }))
    if (errors.sku) setErrors((prev) => ({ ...prev, sku: null }))
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  // Allow the Add Product "Price Calculator" card to write its suggested
  // piece price into this field — the shop manager stays in full control.
  useEffect(() => {
    if (!externalUnitPrice || !externalUnitPrice.nonce || externalUnitPrice.value == null) return
    handleChange('unitPrice', String(externalUnitPrice.value))
    const el = document.getElementById('unitPriceInput')
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    el?.focus?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalUnitPrice])

  const stopStream = () => {
    streamRef.current?.getTracks?.().forEach((t) => t.stop())
    streamRef.current = null
  }

  const openCamera = () => {
    setCameraError('')
    setCameraOpen(true)
  }

  const closeCamera = () => {
    setCameraOpen(false)
    stopStream()
  }

  useEffect(() => {
    if (!cameraOpen) return
    let cancelled = false
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch {
        if (!cancelled) setCameraError('Camera unavailable — allow camera access, or use "Choose Photo" instead.')
      }
    }
    start()
    return () => { cancelled = true; stopStream() }
  }, [cameraOpen])

  const uploadBlob = async (file) => {
    setUploading(true)
    setErrors((prev) => ({ ...prev, photo: null }))
    try {
      const url = await uploadProductPhoto(file)
      if (!url) throw new Error('Cloudinary did not return a photo URL.')
      setFormData((prev) => {
        const next = [...(prev.photos || []), url]
        return { ...prev, photos: next, photo: prev.photo || url }
      })
    } catch (err) {
      setErrors((prev) => ({ ...prev, photo: err.message || 'Photo upload failed.' }))
    } finally {
      setUploading(false)
    }
  }

  const captureFromCam = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) { setCameraError('Camera still starting — try again in a moment.'); return }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) { setCameraError('Could not capture the photo — try again.'); return }
      closeCamera()
      uploadBlob(blob)
    }, 'image/jpeg', 0.92)
  }

  const handlePhotoFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadBlob(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePhoto = (index) => {
    setFormData((prev) => {
      const next = (prev.photos || []).filter((_, i) => i !== index)
      return { ...prev, photos: next, photo: next[0] || '' }
    })
  }

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Product name is required'
    if (!formData.sku.trim()) errs.sku = 'SKU / Barcode is required'
    if (!formData.category) errs.category = 'Category is required'
    const unitPriceBlank = formData.unitPrice === ''
    const unitPriceInvalid = !unitPriceBlank && isNaN(unitPriceNum)
    const unitPriceNegative = !isNaN(unitPriceNum) && unitPriceNum < 0
    if ((unitPriceBlank && !allowUnpriced) || unitPriceInvalid || unitPriceNegative) {
      errs.unitPrice = 'Enter a valid price per piece'
    }
    if (!isEdit && !(formData.photos?.length)) errs.photo = 'Add a product photo'
    const ppc = Number(formData.piecesPerCarton)
    if (!formData.piecesPerCarton || isNaN(ppc) || ppc < 1) {
      errs.piecesPerCarton = 'Pieces per carton must be at least 1'
    }
    if (formData.quantity !== '' && (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0)) {
      errs.quantity = 'Cartons must be 0 or more'
    }
    if (formData.loosePieces !== '' && (isNaN(Number(formData.loosePieces)) || Number(formData.loosePieces) < 0)) {
      errs.loosePieces = 'Must be 0 or more'
    }
    const loosePc = Number(formData.loosePieces)
    if (Number.isFinite(loosePc) && loosePc > 0 && Number.isFinite(piecesNum) && piecesNum > 1 && loosePc >= piecesNum) {
      errs.loosePieces = `Must be less than pieces per carton (${piecesNum}) — that's a full carton`
    }
    if (formData.reorderLevel !== '' && (isNaN(Number(formData.reorderLevel)) || Number(formData.reorderLevel) < 0)) {
      errs.reorderLevel = 'Reorder level must be 0 or more'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit?.({
      ...formData,
      price: cartonPriceAuto ?? (formData.price !== '' ? Number(formData.price) : 0),
      unitPrice: Number.isFinite(unitPriceNum) ? unitPriceNum : null,
      quantity: Number.isFinite(openingUnits) ? openingUnits : Number(formData.quantity) || 0,
      reorderLevel: Number(formData.reorderLevel) || 1,
      piecesPerCarton: Number(formData.piecesPerCarton) || 1,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Photo */}
      <div className="rounded-2xl border border-line bg-card shadow-soft p-6">
        <div>
          <h3 className="text-sm font-semibold text-ink">Product Photo</h3>
          <p className="text-xs text-gray-400">
            Add up to 12 photos — the first is the cover shown on cards and labels.
          </p>
        </div>

        {/* Photo grid + add tile */}
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {(formData.photos || []).map((url, index) => (
            <div
              key={url}
              className={`relative aspect-[4/3] rounded-2xl overflow-hidden border ${errors.photo && index === 0 ? 'border-red-300' : 'border-line'}`}
            >
              <img src={url} alt={`Product photo ${index + 1}`} className="w-full h-full object-cover" />
              {index === 0 && (
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold uppercase tracking-wide">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removePhoto(index)}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center transition-colors hover:bg-red-600"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {(formData.photos?.length || 0) < 12 && (
            uploading ? (
              <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-line bg-page/60 flex flex-col items-center justify-center gap-2 text-gray-400">
                <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
                </svg>
                <span className="text-[11px] font-medium">Uploading…</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-[background-color,border-color] duration-150 ${errors.photo && !(formData.photos?.length) ? 'border-red-300 bg-red-50/40 text-rose-500' : 'border-line bg-page/60 text-gray-400 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600'}`}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="M21 15l-5-5L5 21M15 21l3-3" />
                </svg>
                <span className="text-[11px] font-medium">Add photo</span>
              </button>
            )
          )}
        </div>
        {errors.photo && <p className="text-xs text-rose-500 mt-2">{errors.photo}</p>}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={openCamera}
            disabled={uploading || (formData.photos?.length || 0) >= 12}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Take Photo
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || (formData.photos?.length || 0) >= 12}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink transition-[transform,background-color,color] duration-150 hover:bg-page active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {formData.photos?.length ? 'Add More' : 'Choose Photo'}
          </button>
          {(formData.photos?.length || 0) > 1 && (
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, photos: [prev.photos[0]], photo: prev.photos[0] }))}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink transition-[transform,background-color,color] duration-150 hover:bg-page active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" />
              </svg>
              Remove All
            </button>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="rounded-2xl border border-line bg-card shadow-soft p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">Product Identification</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-ink mb-1.5">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Men Leather Shoes"
              className={`h-11 w-full rounded-lg border px-3.5 text-sm text-ink placeholder:text-muted/55 outline-none transition-all ${
                errors.name
                  ? 'border-red-400 focus:border-red-500 focus:outline focus:outline-2 focus:outline-red-500/25'
                  : 'border-line focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink outline-none transition-all focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* SKU */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-ink">
                SKU / Barcode <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={generateSku}
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                Auto-generate
              </button>
            </div>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
              placeholder="e.g. SHOE-001"
              className={`h-11 w-full rounded-lg border px-3.5 text-sm text-ink placeholder:text-muted/55 font-mono uppercase outline-none transition-all ${
                errors.sku
                  ? 'border-red-400 focus:border-red-500 focus:outline focus:outline-2 focus:outline-red-500/25'
                  : 'border-line focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25'
              }`}
            />
            {errors.sku && <p className="text-xs text-rose-500 mt-1">{errors.sku}</p>}
          </div>
        </div>
      </div>

      {/* Pricing & Stock Details */}
      <div className="rounded-2xl border border-line bg-card shadow-soft p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">Price & Stock Info</h3>
          <p className="text-xs text-gray-400">Piece price × pieces per carton = carton price.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Price per Piece */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Price per Piece (RWF) {!allowUnpriced && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400 pointer-events-none">
                RWF
              </span>
              <input
                id="unitPriceInput"
                type="number"
                min="0"
                step="50"
                value={formData.unitPrice}
                onChange={(e) => handleChange('unitPrice', e.target.value)}
                placeholder="e.g. 40000"
                className={`h-11 w-full rounded-lg border pl-14 pr-3.5 text-sm text-ink placeholder:text-muted/55 font-semibold outline-none transition-all ${
                  errors.unitPrice
                    ? 'border-red-400 focus:border-red-500 focus:outline focus:outline-2 focus:outline-red-500/25'
                    : 'border-line focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25'
                }`}
              />
            </div>
            {errors.unitPrice ? (
              <p className="text-xs text-rose-500 mt-1">{errors.unitPrice}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                {allowUnpriced ? 'Optional — can be set later by the price approver.' : 'Cost of one piece.'}
              </p>
            )}
          </div>

          {/* Pieces per Carton */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Pieces per Carton <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={formData.piecesPerCarton}
              onChange={(e) => handleChange('piecesPerCarton', e.target.value)}
              disabled={verified}
              placeholder="20"
              className={`h-11 w-full rounded-lg border px-3.5 text-sm text-ink placeholder:text-muted/55 outline-none transition-all ${
                verified
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : errors.piecesPerCarton
                    ? 'border-red-400 focus:border-red-500 focus:outline focus:outline-2 focus:outline-red-500/25'
                    : 'border-line focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25'
              }`}
            />
            <p className="text-xs text-gray-400 mt-1">
              e.g. 20 pairs in one carton of Airforce.{' '}
              {verified && <span className="text-emerald-600 font-medium">(locked while verified — unverify to change)</span>}
              {errors.piecesPerCarton && <span className="text-rose-500">{errors.piecesPerCarton}</span>}
            </p>
          </div>
        </div>

        {/* Auto-calculated Carton Price */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border px-4 py-3.5 transition-colors ${
            cartonPriceAuto != null ? 'border-brand-200 bg-brand-50/70' : 'border-line bg-page'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-ink">
              Carton Price {cartonPriceAuto != null && <span className="text-brand-700">· auto-calculated</span>}
            </p>
            <p className="text-[11px] text-gray-400">Price per piece × pieces per carton</p>
          </div>
          <p className={`text-lg font-bold tabular-nums ${cartonPriceAuto != null ? 'text-brand-800' : 'text-gray-400'}`}>
            {cartonPriceAuto != null ? formatCurrency(cartonPriceAuto) : 'RWF —'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Stock — always cartons (halves ok) + leftover pieces, same on Add and Edit */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              {isEdit ? 'Stock on Hand' : 'Starting Stock'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  disabled={verified}
                  placeholder="3"
                  aria-label="Full cartons"
                  className={`h-11 w-full rounded-lg border px-3.5 text-sm text-ink placeholder:text-muted/55 tabular-nums outline-none transition-all ${
                    verified
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : errors.quantity
                        ? 'border-red-400 focus:border-red-500 focus:outline focus:outline-2 focus:outline-red-500/25'
                        : 'border-line focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25'
                  }`}
                />
                <p className="text-[11px] text-gray-400 mt-1">Cartons (halves ok, e.g. 3.5)</p>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  max={Number.isFinite(piecesNum) && piecesNum > 1 ? piecesNum - 1 : undefined}
                  value={formData.loosePieces}
                  onChange={(e) => handleChange('loosePieces', e.target.value)}
                  disabled={verified}
                  placeholder="0"
                  aria-label="Leftover pieces"
                  className={`h-11 w-full rounded-lg border px-3.5 text-sm text-ink placeholder:text-muted/55 tabular-nums outline-none transition-all ${
                    verified
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : errors.loosePieces
                        ? 'border-red-400 focus:border-red-500 focus:outline focus:outline-2 focus:outline-red-500/25'
                        : 'border-line focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25'
                  }`}
                />
                <p className="text-[11px] text-gray-400 mt-1">Leftover pieces</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {isEdit ? 'Stock you have right now — cartons + leftover.' : 'Opening stock you have right now — cartons + leftover.'}{' '}
              {verified && <span className="text-emerald-600 font-medium">Locked while verified — manage it via Stock In / Stock Out.</span>}
            </p>
            {errors.quantity && <p className="text-xs text-rose-500 mt-1">{errors.quantity}</p>}
            {errors.loosePieces && <p className="text-xs text-rose-500 mt-1">{errors.loosePieces}</p>}
            {Number.isFinite(openingUnits) && openingUnits > 0 && (
              <p className="text-xs font-semibold text-brand-700 mt-1.5 tabular-nums">
                = {fullCartons} carton{fullCartons === 1 ? '' : 's'}
                {partialPieces > 0 ? ` + ${partialPieces} (half carton)` : ''}
                {looseNum > 0 ? ` + ${looseNum} leftover` : ''} → {openingUnits} {openingUnits === 1 ? 'piece' : 'pieces'}
              </p>
            )}
          </div>

          {/* Low Stock Alert Level */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Low Stock Alert Level
            </label>
            <input
              type="number"
              min="1"
              value={formData.reorderLevel}
              onChange={(e) => handleChange('reorderLevel', e.target.value)}
              placeholder="15"
              className="h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink placeholder:text-muted/55 outline-none transition-all focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25"
            />
            <p className="text-xs text-gray-400 mt-1">Alert if stock drops below this.</p>
          </div>

          {/* Unit of measure */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              disabled={verified}
              className={`h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition-all ${
                verified
                  ? 'border-line bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-line bg-white text-ink focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25'
              }`}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-ink mb-1.5">
              Notes
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g. Supplier: Bralirwa, Storage: Shelf A2"
              className="h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink placeholder:text-muted/55 outline-none transition-all focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition-[transform,background-color,color] duration-150 active:scale-[0.98] hover:bg-page disabled:opacity-60 disabled:pointer-events-none"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 active:scale-[0.98] hover:bg-brand-800 disabled:opacity-60 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {submitLabel}
        </button>
      </div>

      {/* Camera capture modal — portaled to <body> so the blurred backdrop
          always covers the full screen, matching the rest of the app's modals */}
      {cameraOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={(e) => { if (e.target === e.currentTarget) closeCamera() }}
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Take Product Photo</h3>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-ink transition-colors"
                  aria-label="Close camera"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center px-4">
                    <p className="rounded-lg bg-black/70 px-3 py-2 text-xs text-white text-center">{cameraError}</p>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
                      </svg>
                      Uploading…
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-center">
                <button
                  type="button"
                  onClick={captureFromCam}
                  disabled={!!cameraError || uploading}
                  className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand-700 bg-white text-brand-700 transition-[transform,background-color,color] duration-150 hover:bg-brand-50 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                  aria-label="Capture photo"
                >
                  <span className="h-11 w-11 rounded-full bg-brand-700" />
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-gray-400">Allow camera, then tap to shoot.</p>
            </div>
          </div>,
          document.body
        )}
    </form>
  )
}