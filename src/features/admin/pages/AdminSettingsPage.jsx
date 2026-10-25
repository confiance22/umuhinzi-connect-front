/**
 * AdminSettingsPage — Settings hub (Super Admin). Section cards route to the
 * dedicated settings pages (Security & OTP, Shop Policies). Each card shows a
 * live status chip pulled from the platform settings.
 */
import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../../api/adminApi'
import { useToastContext } from '../../../context/ToastContext'
import { ROUTE_PATHS } from '../../../constants/routePaths'

const LOADING_STATE = { requireAdminOtp: true, allowShopRegistration: true, requireShopApproval: true, allowUnpricedProducts: true }

export const AdminSettingsPage = () => {
  const { showToast } = useToastContext()
  const [settings, setSettings] = useState(LOADING_STATE)
  const [loading, setLoading] = useState(true)
  const toastRef = useRef(showToast)
  toastRef.current = showToast

  useEffect(() => {
    let mounted = true
    adminApi
      .getSettings()
      .then((data) => {
        if (mounted) setSettings(data || LOADING_STATE)
      })
      .catch((err) => {
        if (mounted) toastRef.current(err.message || 'Could not load platform settings', 'error')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const securityChip = loading
    ? 'Checking…'
    : settings.requireAdminOtp
      ? 'Admin OTP enforced'
      : 'Admin OTP off'
  const securityTone = settings.requireAdminOtp ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'

  const shopsChip =
    loading
      ? 'Checking…'
      : !settings.allowShopRegistration
        ? 'Registration closed'
        : settings.requireShopApproval
          ? 'New shops need approval'
          : 'New shops auto-approved'
  const shopsTone = loading
    ? 'bg-page text-muted'
    : settings.allowShopRegistration && settings.requireShopApproval
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-amber-50 text-amber-700'

  const productsChip =
    loading
      ? 'Checking…'
      : settings.allowUnpricedProducts
        ? 'Unpriced products allowed'
        : 'Prices required at creation'
  const productsTone = settings.allowUnpricedProducts ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'

  const SECTIONS = [
    {
      title: 'Security & OTP',
      description: 'Control two-factor authentication. Enforce OTP at login for every super admin and shop manager, or keep it optional.',
      to: ROUTE_PATHS.ADMIN_SETTINGS_SECURITY,
      icon: 'M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z',
      chip: securityChip,
      chipTone: securityTone,
    },
    {
      title: 'Shop Policies',
      description: 'Control public self-registration and whether new shops start approved or are held for review.',
      to: ROUTE_PATHS.ADMIN_SETTINGS_SHOPS,
      icon: 'M3 9l1.5-4h15L21 9M4 9v11h16V9M4 9h16M9 20v-6h6v6',
      chip: shopsChip,
      chipTone: shopsTone,
    },
    {
      title: 'Products & Pricing',
      description: 'Let shops add products without a price so the price-knower sets it later.',
      to: ROUTE_PATHS.ADMIN_SETTINGS_PRODUCTS,
      icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12',
      chip: productsChip,
      chipTone: productsTone,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
          Platform Configuration
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">Settings</h1>
        <p className="text-sm text-muted mt-1">Choose a policy area to manage. Every section is a dedicated page.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {SECTIONS.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="group flex flex-col gap-5 h-full rounded-2xl border border-line bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 transition-colors group-hover:bg-emerald-100">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={section.icon} />
              </svg>
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-ink leading-snug">{section.title}</h3>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${section.chipTone}`}>
                  {section.chip}
                </span>
              </div>
              <p className="text-[13px] text-muted mt-1.5 leading-snug">{section.description}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition-all group-hover:gap-3">
              Open section
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AdminSettingsPage