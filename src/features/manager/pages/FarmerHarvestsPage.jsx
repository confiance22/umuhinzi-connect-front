import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { harvestApi } from '../../../api/harvestApi'
import CustomSelect from '../../../components/common/CustomSelect'
import { useLanguage } from '../../../context/LanguageContext'
import { useToastContext } from '../../../context/ToastContext'
import { ROUTE_PATHS } from '../../../constants/routePaths'
import { RowActionMenu, DockIcons } from '../../../components/admin/RowActions'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'

const STATUS_IDS = ['all', 'active', 'sold', 'hidden', 'expired']

const inputClass =
  'h-11 w-full rounded-xl border border-line bg-[#fbf7ec] px-3.5 text-sm text-ink placeholder:text-gray-400 focus:border-[#84cc16] focus:outline focus:outline-2 focus:outline-[#84cc16]/20'

const FilterField = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
    {children}
  </label>
)

const toPayload = (harvest, overrides = {}) => ({
  crop_name: harvest.cropName || harvest.crop_name,
  quantity_kg: harvest.quantityKg ?? harvest.quantity_kg,
  price_per_kg: harvest.pricePerKg ?? harvest.price_per_kg,
  harvest_date: String(harvest.harvestDate || harvest.harvest_date || '').slice(0, 10),
  district: harvest.district,
  sector: harvest.sector || '',
  description: harvest.description || '',
  image_url: harvest.imageUrl || harvest.image_url || '',
  status: harvest.status || 'active',
  ...overrides
})

const StatusBadge = ({ status, label }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
      status === 'active'
        ? 'bg-[#d9f99d]/20 text-[#3f6212]'
        : status === 'sold'
        ? 'bg-sky-50 text-sky-600'
        : status === 'hidden'
        ? 'bg-[#e8dfca] text-gray-500'
        : 'bg-amber-50 text-amber-600'
    }`}
  >
    {label}
  </span>
)

export const FarmerHarvestsPage = () => {
  const { t } = useLanguage()
  const { showToast } = useToastContext()
  const [harvests, setHarvests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [crop, setCrop] = useState('')
  const [district, setDistrict] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minQuantity, setMinQuantity] = useState('')
  const [maxQuantity, setMaxQuantity] = useState('')
  const [sort, setSort] = useState('newest')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await harvestApi.list()
      setHarvests(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || t('portal.farmer.harvests.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const cropOptions = useMemo(() => {
    const names = [...new Set(harvests.map((harvest) => harvest.cropName).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
    return [
      { value: '', label: t('portal.farmer.common.allCrops') },
      ...names.map((name) => ({ value: name, label: name }))
    ]
  }, [harvests, t])

  const districtOptions = useMemo(() => {
    const names = [...new Set(harvests.map((harvest) => harvest.district).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
    return [
      { value: '', label: t('portal.farmer.common.allDistricts') },
      ...names.map((name) => ({ value: name, label: name }))
    ]
  }, [harvests, t])

  const sortOptions = useMemo(
    () =>
      ['newest', 'oldest', 'priceDesc', 'priceAsc', 'quantityDesc', 'valueDesc', 'cropAsc'].map(
        (key) => ({
          value: key,
          label: t(`portal.farmer.common.${key}`)
        })
      ),
    [t]
  )

  const counts = useMemo(
    () =>
      harvests.reduce(
        (acc, harvest) => {
          acc.all += 1
          if (acc[harvest.status] != null) acc[harvest.status] += 1
          return acc
        },
        { all: 0, active: 0, sold: 0, hidden: 0, expired: 0 }
      ),
    [harvests]
  )

  const advancedCount = [
    crop,
    district,
    fromDate,
    toDate,
    minPrice,
    maxPrice,
    minQuantity,
    maxQuantity
  ].filter(Boolean).length

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    const rows = harvests.filter((harvest) => {
      if (filter !== 'all' && harvest.status !== filter) return false
      if (crop && harvest.cropName !== crop) return false
      if (district && harvest.district !== district) return false

      const harvestDate = String(harvest.harvestDate || '').slice(0, 10)
      if (fromDate && harvestDate < fromDate) return false
      if (toDate && harvestDate > toDate) return false

      const price = Number(harvest.pricePerKg) || 0
      if (minPrice && price < Number(minPrice)) return false
      if (maxPrice && price > Number(maxPrice)) return false

      const quantity = Number(harvest.quantityKg) || 0
      if (minQuantity && quantity < Number(minQuantity)) return false
      if (maxQuantity && quantity > Number(maxQuantity)) return false

      if (!needle) return true
      return [harvest.cropName, harvest.district, harvest.sector, harvest.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    })

    return rows.sort((a, b) => {
      if (sort === 'newest' || sort === 'oldest') {
        const direction = sort === 'newest' ? -1 : 1
        return (
          direction *
          String(a.harvestDate || '').localeCompare(String(b.harvestDate || ''))
        )
      }
      if (sort === 'priceDesc') return Number(b.pricePerKg) - Number(a.pricePerKg)
      if (sort === 'priceAsc') return Number(a.pricePerKg) - Number(b.pricePerKg)
      if (sort === 'quantityDesc') return Number(b.quantityKg) - Number(a.quantityKg)
      if (sort === 'valueDesc') return Number(b.totalValue) - Number(a.totalValue)
      return String(a.cropName || '').localeCompare(String(b.cropName || ''))
    })
  }, [
    crop,
    district,
    filter,
    fromDate,
    harvests,
    maxPrice,
    maxQuantity,
    minPrice,
    minQuantity,
    search,
    sort,
    toDate
  ])

  const clearFilters = () => {
    setFilter('all')
    setSearch('')
    setCrop('')
    setDistrict('')
    setFromDate('')
    setToDate('')
    setMinPrice('')
    setMaxPrice('')
    setMinQuantity('')
    setMaxQuantity('')
    setSort('newest')
  }

  const updateStatus = async (harvest, status) => {
    setBusyId(harvest.id)
    try {
      const updated = await harvestApi.update(harvest.id, toPayload(harvest, { status }))
      setHarvests((rows) => rows.map((row) => (row.id === harvest.id ? updated : row)))
      showToast(`${harvest.cropName} · ${t('portal.farmer.harvests.markedSold')}`, 'success')
    } catch (err) {
      showToast(err?.message || t('portal.farmer.harvests.updateError'), 'error')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (harvest) => {
    if (!window.confirm(`${harvest.cropName} — ${t('portal.farmer.harvests.deleteConfirm')}`)) return
    setBusyId(harvest.id)
    try {
      await harvestApi.remove(harvest.id)
      setHarvests((rows) => rows.filter((row) => row.id !== harvest.id))
      showToast(t('portal.farmer.harvests.deleted'), 'success')
    } catch (err) {
      showToast(err?.message || t('portal.farmer.harvests.deleteError'), 'error')
    } finally {
      setBusyId(null)
    }
  }

  const currencyParts = (value) => {
    const formatted = formatCurrency(value)
    const match = formatted.match(/^(\D*?)([\d,.\s]+)(.*)$/)
    if (!match) return { symbol: '', number: formatted }
    return { symbol: (match[1] || match[3] || '').trim(), number: match[2].trim() }
  }

  return (
    <div className="space-y-6 bg-[#f6f1e6]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block rounded-full bg-[#d9f99d]/20 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[#3f6212]">
            {t('portal.farmer.harvests.badge')}
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {t('portal.farmer.harvests.title')}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {counts.all} {t('portal.farmer.harvests.subtitle')} · {counts.active}{' '}
            {t('portal.farmer.common.active').toLowerCase()}
          </p>
        </div>
        <Link
          to={ROUTE_PATHS.PRODUCT_ADD}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d9f99d] px-5 py-2.5 text-sm font-semibold text-[#0f3d25] transition-colors hover:bg-[#c3f27f]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          {t('portal.farmer.harvests.list')}
        </Link>
      </div>

      <div className="rounded-2xl border border-line bg-[#efe7d6] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-line px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit rounded-xl border border-line bg-page p-1">
            {STATUS_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  filter === id
                    ? 'bg-[#d9f99d] text-[#0f3d25] shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {t(`portal.farmer.common.${id}`)}
                <span className="ml-1.5 tabular-nums text-xs text-gray-400">
                  {counts[id] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <label className="relative block w-full sm:w-72">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('portal.farmer.harvests.searchPlaceholder')}
                className="h-11 w-full rounded-xl border border-line bg-[#fbf7ec] pl-10 pr-3 text-sm text-ink placeholder:text-gray-400 focus:border-[#84cc16] focus:outline focus:outline-2 focus:outline-[#84cc16]/20"
              />
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                filtersOpen || advancedCount
                  ? 'border-[#84cc16]/40 bg-[#d9f99d]/20 text-[#3f6212]'
                  : 'border-line bg-[#fbf7ec] text-muted hover:text-ink'
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
              </svg>
              Filters
              {advancedCount > 0 && (
                <span className="rounded-full bg-[#d9f99d] px-1.5 py-0.5 text-[10px] font-bold text-[#0f3d25]">
                  {advancedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="border-b border-line bg-page/40 p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <FilterField label="Crop">
                <CustomSelect value={crop} onChange={setCrop} options={cropOptions} tone="public" />
              </FilterField>
              <FilterField label="District">
                <CustomSelect value={district} onChange={setDistrict} options={districtOptions} tone="public" />
              </FilterField>
              <FilterField label="Sort By">
                <CustomSelect value={sort} onChange={setSort} options={sortOptions} tone="public" />
              </FilterField>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <FilterField label="From Date">
                <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className={inputClass} />
              </FilterField>
              <FilterField label="To Date">
                <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className={inputClass} />
              </FilterField>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FilterField label="Min Price">
                <input type="number" min="0" step="any" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="0" className={inputClass} />
              </FilterField>
              <FilterField label="Max Price">
                <input type="number" min="0" step="any" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="0" className={inputClass} />
              </FilterField>
              <FilterField label="Min Qty">
                <input type="number" min="0" step="any" value={minQuantity} onChange={(event) => setMinQuantity(event.target.value)} placeholder="0" className={inputClass} />
              </FilterField>
              <FilterField label="Max Qty">
                <input type="number" min="0" step="any" value={maxQuantity} onChange={(event) => setMaxQuantity(event.target.value)} placeholder="0" className={inputClass} />
              </FilterField>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted">
                Showing <span className="font-semibold text-ink">{visible.length}</span> of{' '}
                <span className="font-semibold text-ink">{harvests.length}</span> results
              </p>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!advancedCount && !search && filter === 'all' && sort === 'newest'}
                className="text-xs font-semibold text-[#3f6212] hover:text-[#365314] disabled:cursor-not-allowed disabled:text-gray-300"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[#e8dfca]" />
            ))}
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-ink">{t('portal.farmer.harvests.loadError')}</p>
            <p className="mt-1 text-sm text-muted">{t('portal.farmer.common.offline')}</p>
            <button
              type="button"
              onClick={load}
              className="mt-5 rounded-full bg-[#d9f99d] px-5 py-2.5 text-sm font-semibold text-[#0f3d25] hover:bg-[#c3f27f]"
            >
              {t('portal.farmer.common.tryAgain')}
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-ink">
              {harvests.length === 0
                ? t('portal.farmer.harvests.noHarvests')
                : t('portal.farmer.harvests.noMatch')}
            </p>
            <p className="mt-1 text-sm text-muted">
              {harvests.length === 0
                ? t('portal.farmer.harvests.noHarvestsText')
                : t('portal.farmer.harvests.noMatchText')}
            </p>
            {harvests.length === 0 && (
              <Link
                to={ROUTE_PATHS.PRODUCT_ADD}
                className="mt-5 inline-flex rounded-full bg-[#d9f99d] px-5 py-2.5 text-sm font-semibold text-[#0f3d25] hover:bg-[#c3f27f]"
              >
                {t('portal.farmer.harvests.list')}
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="min-w-[120px] px-6 py-3 text-left font-semibold">ACTIONS</th>
                  <th className="min-w-[260px] px-6 py-3 font-semibold">CROP</th>
                  <th className="min-w-[110px] px-4 py-3 text-center font-semibold">QUANTITY</th>
                  <th className="min-w-[120px] px-4 py-3 text-center font-semibold">PRICE / KG</th>
                  <th className="min-w-[120px] px-4 py-3 text-left font-semibold">VALUE</th>
                  <th className="min-w-[120px] px-4 py-3 text-left font-semibold">HARVEST DATE</th>
                  <th className="min-w-[100px] px-4 py-3 text-left font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((harvest) => {
                  const price = currencyParts(harvest.pricePerKg)
                  const value = currencyParts(harvest.totalValue)
                  return (
                    <tr key={harvest.id} className="transition-colors hover:bg-page/60">
                      <td className="min-w-[120px] px-6 py-4 text-right">
                        <RowActionMenu
                          items={[
                            ...(harvest.status === 'active'
                              ? [{ label: t('portal.farmer.common.markSold'), icon: DockIcons.check, onClick: () => updateStatus(harvest, 'sold') }]
                              : []),
                            { label: t('portal.farmer.common.edit'), icon: DockIcons.edit, onClick: () => navigate(ROUTE_PATHS.PRODUCT_EDIT(harvest.id)) },
                            { label: t('portal.farmer.common.delete'), icon: DockIcons.trash, danger: true, onClick: () => remove(harvest) }
                          ]}
                        />
                      </td>
                      <td className="min-w-[260px] px-6 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d9f99d]/20 text-sm font-bold text-[#3f6212]">
                            {harvest.cropName?.charAt(0)?.toUpperCase() || 'H'}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-ink">{harvest.cropName}</p>
                            <p className="truncate text-xs text-gray-400">
                              {harvest.district}
                              {harvest.sector ? ` · ${harvest.sector}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="min-w-[110px] px-4 py-4 text-center tabular-nums text-ink">
                        {Number(harvest.quantityKg).toLocaleString()}{' '}
                        <span className="text-xs text-gray-400">{t('portal.farmer.common.kg')}</span>
                      </td>
                      <td className="min-w-[120px] px-4 py-4 text-center tabular-nums text-ink">
                        <span className="text-xs text-gray-400">{price.symbol}</span> {price.number}
                      </td>
                      <td className="min-w-[120px] px-4 py-4 tabular-nums font-semibold text-ink">
                        <span className="text-xs text-gray-400">{value.symbol}</span> {value.number}
                      </td>
                      <td className="min-w-[120px] px-4 py-4 text-muted">{formatDate(harvest.harvestDate)}</td>
                      <td className="min-w-[100px] px-4 py-4">
                        <StatusBadge
                          status={harvest.status}
                          label={t(`portal.farmer.common.${harvest.status || 'active'}`)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmerHarvestsPage
