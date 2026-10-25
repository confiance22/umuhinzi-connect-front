/**
 * ShopAccountSettingsPage — Shop Manager: store identity + manager profile.
 * Reads shop from GET /workers/me/shop and manager from the session user;
 * writes via PUT /workers/me/shop and PUT /workers/me/profile.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToastContext } from '../../context/ToastContext'
import { workerApi } from '../../api/workerApi'
import UsernameField from '../../components/common/UsernameField'

const DEFAULT_SHOP = {
  name: '',
  code: '',
  address: '',
  contactPersonEmail: '',
  contactPersonPhone: '',
  website: '',
  currency: 'RWF',
}

export const ShopAccountSettingsPage = () => {
  const { user, setUser } = useAuth()
  const { showToast } = useToastContext()
  const [shop, setShop] = useState(DEFAULT_SHOP)
  const [manager, setManager] = useState({ name: '', email: '', phone: '', username: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState('idle')
  const toastRef = useRef(showToast)
  toastRef.current = showToast

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const loaded = { ...DEFAULT_SHOP }
      try {
        Object.assign(loaded, await workerApi.getMyShop())
      } catch (err) {
        if (!cancelled) toastRef.current(err.message || 'Could not load shop profile', 'error')
      }
      if (cancelled) return
      setShop(loaded)
      setManager({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        username: user?.username || '',
      })
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  const handleChange = (field, value) => {
    setShop((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleManagerChange = (field, value) => {
    setManager((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const updatedShop = await workerApi.updateMyShop({
        name: shop.name,
        address: shop.address,
        contactPersonEmail: shop.contactPersonEmail,
        contactPersonPhone: shop.contactPersonPhone,
        website: shop.website,
      })
      const updatedSelf = await workerApi.updateSelf({
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        username: manager.username,
      })
      setShop((prev) => ({ ...prev, ...updatedShop }))
      setManager((prev) => ({ ...prev, ...updatedSelf }))
      if (setUser) setUser((prevUser) => ({ ...prevUser, ...updatedSelf }))
      setHasChanges(false)
      toastRef.current('Shop & account saved', 'success')
    } catch (err) {
      toastRef.current(err?.message || 'Failed to save changes', 'error')
    } finally {
      setSaving(false)
    }
  }, [shop, manager, setUser])

  const usernameBlocked = ['checking', 'taken', 'invalid'].includes(usernameStatus)

  const initials = (manager.name || 'M')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const inputClass =
    'h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all'

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-64 bg-gray-200 rounded-xl" />
        <div className="h-12 w-full bg-gray-200/70 rounded-2xl" />
        <div className="h-72 w-full bg-gray-200/70 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="inline-block text-xs font-medium uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
            Settings · Shop & Account
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">Shop & Account</h1>
          <p className="text-sm text-muted mt-1">
            Store identity and the manager profile that runs it. Changes save instantly to your shop.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full animate-pulse">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges || usernameBlocked}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            )}
            Save changes
          </button>
        </div>
      </div>

      {/* Shop profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-line bg-card shadow-soft p-6 space-y-5">
          <h3 className="text-base font-semibold text-ink">Commercial Store Identity</h3>
          <p className="text-[13px] text-muted">
            Official store identification used across inventory sheets, receipts, and supply orders.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Store Name</label>
              <input type="text" value={shop.name} onChange={(e) => handleChange('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Branch Code</label>
              <input
                type="text"
                readOnly
                value={shop.code}
                className={`${inputClass} bg-gray-50 text-gray-500 outline-none cursor-not-allowed font-mono`}
                title="Branch code is assigned when the shop is created and cannot be changed"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1.5">Physical Address / Sector</label>
              <input type="text" value={shop.address} onChange={(e) => handleChange('address', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Store Contact Phone</label>
              <input
                type="text"
                value={shop.contactPersonPhone}
                onChange={(e) => handleChange('contactPersonPhone', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Store Contact Email</label>
              <input
                type="email"
                value={shop.contactPersonEmail}
                onChange={(e) => handleChange('contactPersonEmail', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1.5">Website</label>
              <input
                type="text"
                value={shop.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-ink p-6 text-white shadow-soft relative overflow-hidden">
            <span className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-300">Active Branch</span>
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              </div>
              <h4 className="text-lg font-bold mt-3 leading-snug">{shop.name}</h4>
              <p className="text-xs text-brand-100/70 font-mono mt-0.5">{shop.code}</p>
              <p className="text-xs text-brand-50/80 mt-3">{shop.address}</p>
              <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between text-xs">
                <span className="text-white/60">Currency</span>
                <span className="font-bold text-white bg-white/20 px-2.5 py-0.5 rounded-full">
                  {shop.currency} (Rwandan Franc)
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card shadow-soft p-5 text-xs space-y-3">
            <h4 className="font-semibold text-ink">Store Status</h4>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Platform Approval</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">APPROVED</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Operation Mode</span>
              <span className="font-semibold text-ink">Online & Synchronized</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Website</span>
              <span className="text-ink font-mono text-xs truncate">{shop.website || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manager account */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-line bg-card shadow-soft p-6 space-y-5">
          <h3 className="text-base font-semibold text-ink">Manager Profile Details</h3>
          <p className="text-[13px] text-muted">
            Personal contact information for system notifications and administrative communications.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Full Name</label>
              <input
                type="text"
                value={manager.name}
                onChange={(e) => handleManagerChange('name', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email Address</label>
              <input
                type="email"
                value={manager.email}
                onChange={(e) => handleManagerChange('email', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Phone Number</label>
              <input
                type="text"
                value={manager.phone}
                onChange={(e) => handleManagerChange('phone', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <UsernameField
                value={manager.username}
                onChange={(v) => handleManagerChange('username', v)}
                currentUsername={user?.username}
                excludeId={user?.id}
                label="Sign-in Username"
                placeholder="e.g. kenny"
                onStatusChange={setUsernameStatus}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Role Designation</label>
              <input
                type="text"
                readOnly
                value="Shop Manager"
                className={`${inputClass} bg-gray-50 text-gray-500 outline-none cursor-not-allowed`}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card shadow-soft p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-brand-700 text-white flex items-center justify-center text-2xl font-bold shadow-md">
            {initials}
          </div>
          <h4 className="text-sm font-semibold text-ink mt-4">{manager.name}</h4>
          <p className="text-xs text-muted mt-0.5">{manager.email}</p>
          <span className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-brand-50 text-brand-700">
            Shop Manager
          </span>

          <div className="w-full border-t border-line mt-6 pt-4 text-left text-xs space-y-2 text-gray-500">
            <div className="flex justify-between">
              <span>Authorized Store:</span>
              <span className="font-semibold text-ink">{shop.code}</span>
            </div>
            <div className="flex justify-between">
              <span>Two-Factor OTP:</span>
              <span className={`font-semibold ${user?.otpEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                {user?.otpEnabled ? 'Enabled' : 'Off'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Access Tier:</span>
              <span className="font-semibold text-ink">Shop Manager</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopAccountSettingsPage