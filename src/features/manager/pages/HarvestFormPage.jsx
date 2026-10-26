/**
 * HarvestFormPage — add or edit a harvest listing. Uses only /api/harvests.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CustomSelect from '../../../components/common/CustomSelect'
import { harvestApi } from '../../../api/harvestApi'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../hooks/useAuth'
import { useToastContext } from '../../../context/ToastContext'
import { ROUTE_PATHS } from '../../../constants/routePaths'
import { formatCurrency } from '../../../utils/formatCurrency'

const CROP_SUGGESTIONS = [
  'Maize',
  'Beans',
  'Rice',
  'Irish potatoes',
  'Sweet potatoes',
  'Cassava',
  'Bananas',
  'Tomatoes',
  'Onions',
  'Cabbage',
  'Carrots',
  'Avocado',
  'Coffee',
  'Tea',
  'Soybeans',
  'Groundnuts'
]

const today = () => new Date().toISOString().slice(0, 10)

const fieldClass =
  'h-11 w-full rounded-xl border border-line bg-page px-3.5 text-sm text-ink placeholder:text-gray-400 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/20'

const labelClass = 'mb-1.5 block text-sm font-medium text-ink'

export const HarvestFormPage = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user } = useAuth()
  const { showToast } = useToastContext()

  const statusOptions = useMemo(
    () => [
      { value: 'active', label: t('portal.farmer.form.statusActive') },
      { value: 'sold', label: t('portal.farmer.form.statusSold') },
      { value: 'hidden', label: t('portal.farmer.form.statusHidden') },
      { value: 'expired', label: t('portal.farmer.form.statusExpired') }
    ],
    [t]
  )

  const [form, setForm] = useState({
    crop_name: '',
    quantity_kg: '',
    price_per_kg: '',
    harvest_date: today(),
    district: '',
    sector: '',
    description: '',
    image_url: '',
    status: 'active'
  })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) {
      setForm((prev) => ({
        ...prev,
        district: prev.district || user?.district || '',
        sector: prev.sector || user?.sector || ''
      }))
    }
  }, [isEdit, user?.district, user?.sector])

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    setLoading(true)
    harvestApi
      .get(id)
      .then((harvest) => {
        if (cancelled) return
        setForm({
          crop_name: harvest.cropName || '',
          quantity_kg: harvest.quantityKg ?? '',
          price_per_kg: harvest.pricePerKg ?? '',
          harvest_date: String(harvest.harvestDate || '').slice(0, 10),
          district: harvest.district || '',
          sector: harvest.sector || '',
          description: harvest.description || '',
          image_url: harvest.imageUrl || '',
          status: harvest.status || 'active'
        })
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || t('portal.farmer.form.loadError'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  const change = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const quantity = Number(form.quantity_kg) || 0
  const price = Number(form.price_per_kg) || 0
  const total = quantity * price

  const validate = () => {
    if (!form.crop_name.trim()) return t('portal.farmer.form.errorCrop')
    if (!quantity || quantity <= 0) return t('portal.farmer.form.errorQty')
    if (!price || price <= 0) return t('portal.farmer.form.errorPrice')
    if (!form.harvest_date) return t('portal.farmer.form.errorDate')
    if (!form.district.trim()) return t('portal.farmer.form.errorDistrict')
    if (form.image_url.trim() && !/^https?:\/\/\S+$/i.test(form.image_url.trim())) {
      return t('portal.farmer.form.errorImage')
    }
    return ''
  }

  const submit = async (event) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError('')
    const payload = {
      crop_name: form.crop_name.trim(),
      quantity_kg: Number(form.quantity_kg),
      price_per_kg: Number(form.price_per_kg),
      harvest_date: form.harvest_date,
      district: form.district.trim(),
      sector: form.sector.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      status: form.status
    }

    try {
      if (isEdit) {
        await harvestApi.update(id, payload)
        showToast(t('portal.farmer.form.updated'), 'success')
      } else {
        await harvestApi.create(payload)
        showToast(t('portal.farmer.form.listed'), 'success')
      }
      navigate(ROUTE_PATHS.PRODUCTS)
    } catch (err) {
      setError(err?.message || t('portal.farmer.form.saveError'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-10 w-64 rounded-xl bg-gray-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-[32rem] rounded-2xl bg-gray-200/70 lg:col-span-2" />
          <div className="h-72 rounded-2xl bg-gray-200/70" />
        </div>
      </div>
    )
  }

  if (isEdit && error && !form.crop_name) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="rounded-2xl border border-line bg-card p-8 shadow-soft">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-ink">{error}</h2>
          <p className="mt-1 text-xs text-muted">The requested harvest listing could not be found or has been removed.</p>
          <Link
            to={ROUTE_PATHS.PRODUCTS}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {t('portal.farmer.form.back')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          to={ROUTE_PATHS.PRODUCTS}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('portal.farmer.form.back')}
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {isEdit ? t('portal.farmer.form.editTitle') : t('portal.farmer.form.addTitle')}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isEdit
            ? t('portal.farmer.form.editSubtitle')
            : t('portal.farmer.form.addSubtitle')}
        </p>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-line bg-card p-6 shadow-soft">
            <h2 className="text-sm font-semibold text-ink">
              {t('portal.farmer.form.produceDetails')}
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {t('portal.farmer.form.produceDetailsText')}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="crop_name">
                  {t('portal.farmer.form.crop')}
                </label>
                <input
                  id="crop_name"
                  list="crop-suggestions"
                  value={form.crop_name}
                  onChange={change('crop_name')}
                  placeholder={t('portal.farmer.form.cropPlaceholder')}
                  className={fieldClass}
                />
                <datalist id="crop-suggestions">
                  {CROP_SUGGESTIONS.map((crop) => (
                    <option key={crop} value={crop} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className={labelClass} htmlFor="quantity_kg">
                  {t('portal.farmer.form.quantityKg')}
                </label>
                <input
                  id="quantity_kg"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.quantity_kg}
                  onChange={change('quantity_kg')}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="price_per_kg">
                  {t('portal.farmer.form.pricePerKg')}
                </label>
                <input
                  id="price_per_kg"
                  type="number"
                  min="1"
                  step="1"
                  value={form.price_per_kg}
                  onChange={change('price_per_kg')}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="harvest_date">
                  {t('portal.farmer.form.harvestDate')}
                </label>
                <input
                  id="harvest_date"
                  type="date"
                  value={form.harvest_date}
                  onChange={change('harvest_date')}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="status">
                  {t('portal.farmer.form.status')}
                </label>
                <CustomSelect
                  id="status"
                  value={form.status}
                  options={statusOptions}
                  onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                  placeholder={t('portal.farmer.common.allStatuses')}
                  tone="public"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="description">
                  {t('portal.farmer.form.description')}{' '}
                  <span className="font-normal text-gray-400">
                    ({t('portal.farmer.common.optional')})
                  </span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  maxLength={2000}
                  value={form.description}
                  onChange={change('description')}
                  placeholder={t('portal.farmer.form.descriptionPlaceholder')}
                  className="w-full rounded-xl border border-line bg-page px-3.5 py-3 text-sm text-ink placeholder:text-gray-400 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/20"
                />
                <p className="mt-1 text-right text-[11px] text-gray-400">
                  {form.description.length}/2000
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6 shadow-soft">
                <h2 className="text-sm font-semibold text-ink">
                  {t('portal.farmer.form.locationPhoto')}
                </h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {t('portal.farmer.form.locationPhotoText')}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="district">
                  {t('portal.farmer.form.district')}
                </label>
                <input
                  id="district"
                  value={form.district}
                  onChange={change('district')}
                  placeholder={t('portal.farmer.form.districtPlaceholder')}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="sector">
                  {t('portal.farmer.form.sector')}{' '}
                  <span className="font-normal text-gray-400">
                    ({t('portal.farmer.common.optional')})
                  </span>
                </label>
                <input
                  id="sector"
                  value={form.sector}
                  onChange={change('sector')}
                  placeholder={t('portal.farmer.form.sectorPlaceholder')}
                  className={fieldClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="image_url">
                  {t('portal.farmer.form.imageUrl')}{' '}
                  <span className="font-normal text-gray-400">
                    ({t('portal.farmer.common.optional')})
                  </span>
                </label>
                <input
                  id="image_url"
                  type="url"
                  value={form.image_url}
                  onChange={change('image_url')}
                  placeholder={t('portal.farmer.form.imageUrlPlaceholder')}
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to={ROUTE_PATHS.PRODUCTS}
              className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-page px-6 text-sm font-semibold text-muted hover:border-gray-300 hover:text-ink"
            >
              {t('portal.farmer.common.cancel')}
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand-600 px-7 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? t('portal.farmer.common.saving')
                : isEdit
                ? t('portal.farmer.form.saveChanges')
                : t('portal.farmer.form.publish')}
            </button>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t('portal.farmer.form.listingPreview')}
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-line bg-page">
              {form.image_url && /^https?:\/\//i.test(form.image_url) ? (
                <img
                  src={form.image_url}
                  alt={form.crop_name || 'Harvest'}
                  className="h-36 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="flex h-36 items-center justify-center bg-brand-50 text-4xl font-bold text-brand-600/40">
                  {form.crop_name?.charAt(0)?.toUpperCase() || 'H'}
                </div>
              )}
              <div className="p-4">
                <p className="truncate text-base font-bold text-ink">
                   {form.crop_name || t('portal.farmer.form.yourCrop')}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {form.district || 'District'} {form.sector ? `· ${form.sector}` : ''}
                </p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold tabular-nums text-brand-700">
                      {formatCurrency(price)}
                    </p>
                    <p className="text-[11px] text-gray-400">
                    {t('portal.farmer.common.perKg')}
                  </p>
                  </div>
                  <span className="rounded-full bg-page px-2.5 py-1 text-xs font-semibold tabular-nums text-ink">
                    {quantity.toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-ink p-5 text-white">
             <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
               {t('portal.farmer.form.totalListingValue')}
             </p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{formatCurrency(total)}</p>
             <p className="mt-1 text-xs text-white/50">
               {quantity.toLocaleString()} {t('portal.farmer.common.kg')} × {formatCurrency(price)}/
               {t('portal.farmer.common.kg')}
             </p>
            <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-white/65">
              <p className="flex items-center gap-2">
                 <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                 {t('portal.farmer.form.activeTip')}
               </p>
               <p className="flex items-center gap-2">
                 <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                 {t('portal.farmer.form.soldTip')}
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  )
}

export default HarvestFormPage
