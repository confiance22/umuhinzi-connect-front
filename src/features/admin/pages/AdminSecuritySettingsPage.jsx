/**
 * AdminSecuritySettingsPage — Security & OTP policies (Super Admin).
 * Backed by the SystemSetting policies requireAdminOtp (super admin login)
 * and requireManagerOtp (shop manager login). Shows the signed-in super
 * admin's own two-factor status and lets them review their account.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../../api/adminApi'
import { useToastContext } from '../../../context/ToastContext'
import SettingToggle from '../../../components/admin/SettingToggle'
import { ActiveSessions } from '../../../components/settings/ActiveSessions'
import { ROUTE_PATHS } from '../../../constants/routePaths'

const LOADING_STATE = { requireAdminOtp: true, requireManagerOtp: false }
const EMPTY_OVERVIEW = { users: { total: 0, active: 0, byRole: {} } }
const isManager = (u) => u?.role === 'shop_manager' || u?.roles?.[0]?.key === 'shop_manager'

export const AdminSecuritySettingsPage = () => {
  const { showToast } = useToastContext()
  const [settings, setSettings] = useState(LOADING_STATE)
  const [overview, setOverview] = useState(EMPTY_OVERVIEW)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingKey, setSavingKey] = useState(null)
  const toastRef = useRef(showToast)
  toastRef.current = showToast

  const load = useCallback(async () => {
    const [settingsRes, overviewRes, usersRes] = await Promise.allSettled([
      adminApi.getSettings(),
      adminApi.getReportsOverview(),
      adminApi.getUsers(),
    ])
    if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value || LOADING_STATE)
    else toastRef.current(settingsRes.reason?.message || 'Could not load security settings', 'error')
    if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value || EMPTY_OVERVIEW)
    if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) setUsers(usersRes.value)
  }, [])

  useEffect(() => {
    load().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshOverview = async () => {
    setRefreshing(true)
    try {
      const [overviewRes, usersRes] = await Promise.allSettled([
        adminApi.getReportsOverview(),
        adminApi.getUsers(),
      ])
      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value || EMPTY_OVERVIEW)
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) setUsers(usersRes.value)
      toastRef.current('Sign-in protections refreshed', 'success')
    } catch (err) {
      toastRef.current(err.message || 'Could not refresh protections', 'error')
    } finally {
      setRefreshing(false)
    }
  }

  const toggleSetting = async (key, next, onLabel, offLabel) => {
    setSavingKey(key)
    try {
      const data = await adminApi.updateSettings({ [key]: next })
      setSettings(data || { ...settings, [key]: next })
      toastRef.current(next ? onLabel : offLabel, 'success')
    } catch (err) {
      toastRef.current(err.message || 'Could not update policy', 'error')
    } finally {
      setSavingKey(null)
    }
  }

  const byRole = overview.users?.byRole || {}
  const adminCount = byRole.super_admin || 0
  const managerCount = byRole.shop_manager || 0
  const workerCount = byRole.worker || 0
  const managerPersonal = users.filter((u) => isManager(u) && u.otpEnabled).length

  const rows = [
    {
      role: 'Super Admins',
      count: adminCount,
      note: 'Platform-wide control — every admin signs in from this portal.',
      enabled: Boolean(settings.requireAdminOtp),
      onLabel: 'OTP enforced',
      offLabel: 'OTP off — password only',
    },
    {
      role: 'Shop Managers',
      count: managerCount,
      personal: managerPersonal,
      note: 'Managers who turned on personal 2FA are protected regardless of this switch.',
      enabled: Boolean(settings.requireManagerOtp),
      onLabel: 'OTP enforced',
      offLabel: 'Optional — personal opt-in',
    },
    {
      role: 'Workers',
      count: workerCount,
      note: 'Workers sign in with their 4-digit PIN, no OTP needed.',
      enabled: false,
      onLabel: 'PIN only',
      offLabel: 'PIN only',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
          Security & OTP
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">Security & OTP</h1>
        <p className="text-sm text-muted mt-1">Password policies, two-factor authentication, and access hardening.</p>
      </div>

      <div className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
        <div className="px-6 py-5 border-b border-line">
          <h3 className="text-base font-semibold text-ink leading-snug">Two-Factor Authentication</h3>
          <p className="text-[13px] text-muted mt-1 leading-snug">
            Choose who must confirm a one-time code at sign-in. Codes are emailed to the account.
          </p>
        </div>
        <div className="divide-y divide-line">
          <SettingToggle
            title="Require OTP for admin login"
            description="Force an emailed one-time passcode on every super admin sign-in. Turn off to let admins sign in with password only — not recommended."
            on={Boolean(settings.requireAdminOtp)}
            busy={savingKey === 'requireAdminOtp'}
            onChange={(next) =>
              toggleSetting(
                'requireAdminOtp',
                next,
                'OTP is now required for every admin login',
                'Admin logins no longer require OTP by default'
              )
            }
          />
          <SettingToggle
            title="Require OTP for shop managers"
            description="Force the same code on every shop manager login too. Managers who enabled personal two-factor stay protected regardless of this switch."
            on={Boolean(settings.requireManagerOtp)}
            busy={savingKey === 'requireManagerOtp'}
            onChange={(next) =>
              toggleSetting(
                'requireManagerOtp',
                next,
                'OTP is now required for every shop manager login',
                'Manager login no longer requires OTP by default'
              )
            }
          />
          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">Your two-factor status</p>
              <p className="text-[13px] text-muted mt-1 leading-snug max-w-2xl">
                Super admins are protected by OTP while the policy above is on. Review and harden your account in My Account.
              </p>
            </div>
            <Link
              to={ROUTE_PATHS.ADMIN_ACCOUNT}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-700 px-6 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-700 hover:text-white shrink-0"
            >
              Review account
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
        <div className="px-6 py-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-ink leading-snug">Who needs a code at sign-in</h3>
            <p className="text-[13px] text-muted mt-1 leading-snug">Live snapshot of how these policies apply today.</p>
          </div>
          <button
            type="button"
            onClick={refreshOverview}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-page disabled:opacity-60 shrink-0"
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
        </div>
        <div className="divide-y divide-line">
          {rows.map((row) => (
            <div key={row.role} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{row.role}</p>
                <p className="text-[13px] text-muted mt-0.5 leading-snug">{row.note}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm tabular-nums text-ink/70">
                  {loading ? '—' : `${row.count} ${row.count === 1 ? 'account' : 'accounts'}`}
                </span>
                {row.personal > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs font-semibold">
                    {row.personal} {row.personal === 1 ? 'has' : 'have'} personal 2FA
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    row.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-page text-muted'
                  }`}
                >
                  {row.enabled && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                  {loading ? 'Checking…' : row.enabled ? row.onLabel : row.offLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ActiveSessions />

      {loading && (
        <div className="rounded-xl border border-line bg-card p-4 text-sm text-muted animate-pulse">
          Loading security settings…
        </div>
      )}
    </div>
  )
}

export default AdminSecuritySettingsPage