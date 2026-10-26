/**
 * AdminShopSettingsPage — Shop policies (Super Admin). Controls public
 * self-registration and whether new shops start APPROVED or PENDING, with a
 * live approval inbox fed by the platform reports snapshot.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../../api/adminApi'
import { useToastContext } from '../../../context/ToastContext'
import SettingToggle from '../../../components/admin/SettingToggle'
import { ROUTE_PATHS } from '../../../constants/routePaths'

const LOADING_STATE = { allowShopRegistration: true, requireShopApproval: true }
const EMPTY_OVERVIEW = { shops: { total: 0, pending: 0, approved: 0, rejected: 0 } }

export const AdminShopSettingsPage = () => {
  const { showToast } = useToastContext()
  const [settings, setSettings] = useState(LOADING_STATE)
  const [overview, setOverview] = useState(EMPTY_OVERVIEW)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingKey, setSavingKey] = useState(null)
  const toastRef = useRef(showToast)
  toastRef.current = showToast

  const load = useCallback(async () => {
    const [settingsRes, overviewRes] = await Promise.allSettled([
      adminApi.getSettings(),
      adminApi.getReportsOverview(),
    ])
    if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value || LOADING_STATE)
    else toastRef.current(settingsRes.reason?.message || 'Could not load shop policies', 'error')
    if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value || EMPTY_OVERVIEW)
    else toastRef.current(overviewRes.reason?.message || 'Could not load shop overview', 'error')
  }, [])

  useEffect(() => {
    load().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshOverview = async () => {
    setRefreshing(true)
    try {
      const data = await adminApi.getReportsOverview()
      setOverview(data || EMPTY_OVERVIEW)
      toastRef.current('Shop overview refreshed', 'success')
    } catch (err) {
      toastRef.current(err.message || 'Could not refresh shop overview', 'error')
    } finally {
      setRefreshing(false)
    }
  }

  const applySetting = async (key, next) => {
    setSavingKey(key)
    try {
      const data = await adminApi.updateSettings({ [key]: next })
      setSettings(data || { ...settings, [key]: next })
      toastRef.current(
        key === 'allowShopRegistration'
          ? next
            ? 'Public shop registration is now open'
            : 'Public shop registration is now closed'
          : next
            ? 'New shops will be held for approval'
            : 'New shops will be approved automatically',
        'success'
      )
    } catch (err) {
      toastRef.current(err.message || 'Could not update shop policy', 'error')
    } finally {
      setSavingKey(null)
    }
  }

  const pending = overview.shops?.pending || 0
  const modeChips = [
    {
      label: 'Registration',
      value: loading ? '…' : settings.allowShopRegistration ? 'Open' : 'Closed',
      tone: settings.allowShopRegistration ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
    },
    {
      label: 'New shops',
      value: loading ? '…' : settings.requireShopApproval ? 'Held for review' : 'Approved instantly',
      tone: settings.requireShopApproval ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Waiting for review',
      value: loading ? '…' : `${pending} ${pending === 1 ? 'shop' : 'shops'}`,
      tone: pending > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
          Shop Policies
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">Shop Policies</h1>
        <p className="text-sm text-muted mt-1">How shops join the platform and who gets in without review.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modeChips.map((chip) => (
          <div key={chip.label} className="rounded-2xl border border-line bg-card shadow-soft p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{chip.label}</p>
            <p className="mt-2 text-lg font-semibold text-ink leading-snug">{chip.value}</p>
            <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${chip.tone}`}>
              {chip.label === 'Registration' && (chip.value === 'Open' ? 'Public sign-up' : 'Admins only')}
              {chip.label === 'New shops' && (chip.value === 'Held for review' ? 'Manual approval' : 'Auto-approval')}
              {chip.label === 'Waiting for review' && (pending > 0 ? 'Needs your attention' : 'All clear')}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
        <div className="px-6 py-5 border-b border-line">
          <h3 className="text-base font-semibold text-ink leading-snug">Registration & Approval</h3>
          <p className="text-[13px] text-muted mt-1 leading-snug">Changes apply platform-wide for all new sign-ups.</p>
        </div>
        <div className="divide-y divide-line">
          <SettingToggle
            title="Allow shop self-registration"
            description="When on, anyone can create a shop and manager account from the public sign-up page. Turn off to restrict sign-ups to super admins only."
            on={Boolean(settings.allowShopRegistration)}
            busy={savingKey === 'allowShopRegistration'}
            onChange={(next) => applySetting('allowShopRegistration', next)}
          />
          <SettingToggle
            title="Require approval for new shops"
            description="When on, self-registered shops start as PENDING and only appear after a super admin approves them. Turn off to approve new shops instantly."
            on={Boolean(settings.requireShopApproval)}
            busy={savingKey === 'requireShopApproval'}
            onChange={(next) => applySetting('requireShopApproval', next)}
          />
          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">Approval inbox</p>
              <p className="text-[13px] text-muted mt-1 leading-snug max-w-2xl">
                {loading
                  ? 'Loading pending shops…'
                  : pending > 0
                    ? `${pending} ${pending === 1 ? 'shop is' : 'shops are'} waiting for your review.`
                    : 'Nothing is waiting — every registered shop has a decision.'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={refreshOverview}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-page disabled:opacity-60"
              >
                <svg
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
                </svg>
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
              <Link
                to={ROUTE_PATHS.ADMIN_SHOPS}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-600 px-6 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-600 hover:text-white"
              >
                Review pending shops
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-line bg-card p-4 text-sm text-muted animate-pulse">
          Loading shop policies…
        </div>
      )}
    </div>
  )
}

export default AdminShopSettingsPage