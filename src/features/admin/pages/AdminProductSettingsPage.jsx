/**
 * AdminProductSettingsPage — Products & Pricing (Super Admin). Controls the
 * "unpriced products" mode: when on, shops can create products without a price
 * and a price-knower sets it later (pending-price flow).
 */
import React, { useState, useEffect, useRef } from 'react'
import { adminApi } from '../../../api/adminApi'
import { useToastContext } from '../../../context/ToastContext'
import SettingToggle from '../../../components/admin/SettingToggle'

const LOADING_STATE = { allowUnpricedProducts: true }

export const AdminProductSettingsPage = () => {
  const { showToast } = useToastContext()
  const [settings, setSettings] = useState(LOADING_STATE)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState(null)
  const toastRef = useRef(showToast)
  toastRef.current = showToast

  useEffect(() => {
    adminApi
      .getSettings()
      .then((data) => {
        if (data) setSettings(data)
      })
      .catch((err) => {
        toastRef.current(err.message || 'Could not load product pricing policies', 'error')
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applySetting = async (next) => {
    setSavingKey('allowUnpricedProducts')
    try {
      const data = await adminApi.updateSettings({ allowUnpricedProducts: next })
      setSettings(data || { ...settings, allowUnpricedProducts: next })
      toastRef.current(
        next
          ? 'Shops can now add products without a price'
          : 'Products now require a price when created',
        'success'
      )
    } catch (err) {
      toastRef.current(err.message || 'Could not update product pricing policy', 'error')
    } finally {
      setSavingKey(null)
    }
  }

  const modeChips = [
    {
      label: 'Unpriced products',
      value: loading ? '…' : settings.allowUnpricedProducts ? 'Allowed' : 'Prices required',
      tone: settings.allowUnpricedProducts ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Applies to',
      value: 'Product creation',
      tone: 'bg-page text-muted border border-line',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
          Products & Pricing
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">Products & Pricing</h1>
        <p className="text-sm text-muted mt-1">Control whether shops must set a price when adding products.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modeChips.map((chip) => (
          <div key={chip.label} className="rounded-2xl border border-line bg-card shadow-soft p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{chip.label}</p>
            <p className="mt-2 text-lg font-semibold text-ink leading-snug">{chip.value}</p>
            <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${chip.tone}`}>
              {chip.label === 'Unpriced products'
                ? settings.allowUnpricedProducts
                  ? 'Two-person flow active'
                  : 'Strict price capture'
                : 'Platform-wide'}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
        <div className="px-6 py-5 border-b border-line">
          <h3 className="text-base font-semibold text-ink leading-snug">Product Pricing Rules</h3>
          <p className="text-[13px] text-muted mt-1 leading-snug">Changes apply to all shops immediately.</p>
        </div>
        <div className="divide-y divide-line">
          <SettingToggle
            title="Let shops add products without a price"
            description="When on, shops can create products with the price left blank. They appear with a “Pending price” badge until the price-knower sets a price. Turn off to require a price at creation (the default behavior)."
            on={Boolean(settings.allowUnpricedProducts)}
            busy={savingKey === 'allowUnpricedProducts'}
            onChange={applySetting}
          />
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-line bg-card p-4 text-sm text-muted animate-pulse">
          Loading product pricing policies…
        </div>
      )}
    </div>
  )
}

export default AdminProductSettingsPage