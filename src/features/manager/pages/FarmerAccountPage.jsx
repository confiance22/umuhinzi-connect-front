/**
 * FarmerAccountPage — self-service profile and password for farmers. Backed by
 * PUT /api/auth/profile and POST /api/auth/password.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { authApi } from '../../../api/authApi'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuthContext } from '../../../context/AuthContext'
import { useToastContext } from '../../../context/ToastContext'
import { ROLE_LABELS } from '../../../constants/roles'

const initialsOf = (name) =>
  (name || 'Farmer')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const inputClass =
  'h-11 w-full rounded-xl border border-line bg-page px-3.5 text-sm text-ink placeholder:text-gray-400 focus:border-[#84cc16] focus:outline focus:outline-2 focus:outline-[#84cc16]/20'

const labelClass = 'mb-1.5 block text-sm font-medium text-ink'

const Detail = ({ label, value }) => (
  <div className="rounded-xl border border-line bg-page px-4 py-3.5">
    <p className="text-xs text-muted">{label}</p>
    <p className="mt-0.5 truncate text-sm font-semibold text-ink">{value || '—'}</p>
  </div>
)

const getTabs = (t) => [
  {
    id: 'overview',
    label: t('portal.farmer.account.profileTab'),
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.1a7.5 7.5 0 0115 0'
  },
  {
    id: 'password',
    label: t('portal.farmer.account.passwordTab'),
    icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M6.75 21h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75A2.25 2.25 0 006.75 21z'
  }
]

export const FarmerAccountPage = () => {
  const { t } = useLanguage()
  const { user, setUser } = useAuthContext()
  const { showToast } = useToastContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabFromUrl = searchParams.get('tab')
  const tabs = getTabs(t)
const activeTab = tabs.some((tab) => tab.id === tabFromUrl) ? tabFromUrl : 'overview'
  const setTab = (id) =>
    setSearchParams(id === 'overview' ? {} : { tab: id }, { replace: true })

  const [profile, setProfile] = useState({ name: '', phone: '', email: '' })
  const [profileError, setProfileError] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwError, setPwError] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    setProfile({
      name: user?.name || user?.full_name || '',
      phone: user?.phone || user?.username || '',
      email: user?.email || ''
    })
  }, [user])

  const saveProfile = async (event) => {
    event.preventDefault()
    setProfileError('')
    setProfileSaving(true)
    try {
      const updated = await authApi.updateProfile({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        email: profile.email.trim()
      })
      setUser({
        ...user,
        ...updated,
        name: updated?.name || updated?.full_name || profile.name.trim(),
        username: updated?.phone || profile.phone.trim()
      })
      showToast(t('portal.farmer.account.profileUpdated'), 'success')
    } catch (err) {
      setProfileError(err?.message || t('portal.farmer.account.profileError'))
    } finally {
      setProfileSaving(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    setPwError('')
    if (pw.newPassword.length < 8) {
      setPwError(t('portal.farmer.account.minPassword'))
      return
    }
    if (pw.newPassword !== pw.confirmPassword) {
      setPwError(t('portal.farmer.account.passwordMismatch'))
      return
    }

    setPwSaving(true)
    try {
      await authApi.changePassword({
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword
      })
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showToast(t('portal.farmer.account.passwordUpdated'), 'success')
      setTab('overview')
    } catch (err) {
      setPwError(err?.message || t('portal.farmer.account.passwordError'))
    } finally {
      setPwSaving(false)
    }
  }

  const displayName = user?.name || user?.full_name || t('portal.farmer.account.farmer')
  const memberSince = user?.createdAt || user?.created_at
  const location = [user?.sector, user?.district, user?.province].filter(Boolean).join(', ')
  const roleLabel = ROLE_LABELS[user?.role] || t('portal.farmer.account.farmer')

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-5">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-[#d9f99d] text-xl font-bold text-[#0f3d25] shadow-lg shadow-[#d9f99d]/25">
          {initialsOf(displayName)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted">
            <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Umuhinzi Connect · {roleLabel}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-[#efe7d6] shadow-soft">
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-line bg-page p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-[transform,background-color,color] duration-150 active:scale-[0.98] ${
                activeTab === tab.id
                  ? 'bg-ink text-white'
                  : 'text-gray-500 hover:bg-page hover:text-ink'
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d={tab.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-6 p-6 sm:p-8">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">Profile details</h2>
              <p className="mt-0.5 text-sm text-gray-400">
                Your phone number and name are visible on your harvests.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label={t("portal.farmer.account.fullName")} value={displayName} />
              <Detail label="Phone" value={user?.phone || user?.username} />
              <Detail label={t("portal.farmer.account.email")} value={user?.email} />
              <Detail label={t("portal.farmer.account.role")} value={roleLabel} />
              <Detail label={t("portal.farmer.account.location")} value={location} />
              <Detail
                label={t("portal.farmer.account.memberSince")}
                value={memberSince ? new Date(memberSince).toLocaleDateString() : null}
              />
            </div>

            <form onSubmit={saveProfile} className="space-y-4 border-t border-line pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="profile-name">
                    Full name
                  </label>
                  <input
                    id="profile-name"
                    required
                    value={profile.name}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="profile-phone">
                    Phone number
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    required
                    value={profile.phone}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="profile-email">
                    Email address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="optional"
                    className={inputClass}
                  />
                </div>
              </div>

              {profileError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {profileError}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="h-11 rounded-full bg-[#d9f99d] px-6 text-sm font-semibold text-[#0f3d25] hover:bg-[#c3f27f] disabled:opacity-60"
                >
                  {profileSaving ? t('portal.farmer.common.saving') : t('portal.farmer.account.saveProfile')}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6 p-6 sm:p-8">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">Change password</h2>
              <p className="mt-0.5 text-sm text-gray-400">
                Use at least 8 characters and a password you do not use elsewhere.
              </p>
            </div>

            <form onSubmit={savePassword} className="max-w-md space-y-4">
              <div>
                <label className={labelClass} htmlFor="current-password">
                  Current password
                </label>
                <input
                  id="current-password"
                  type="password"
                  required
                  value={pw.currentPassword}
                  onChange={(event) =>
                    setPw((prev) => ({ ...prev, currentPassword: event.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="new-password">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  value={pw.newPassword}
                  onChange={(event) =>
                    setPw((prev) => ({ ...prev, newPassword: event.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="confirm-password">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={pw.confirmPassword}
                  onChange={(event) =>
                    setPw((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              {pwError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {pwError}
                </p>
              )}

              <button
                type="submit"
                disabled={pwSaving}
                className="h-11 w-full rounded-full bg-[#d9f99d] px-6 text-sm font-semibold text-[#0f3d25] hover:bg-[#c3f27f] disabled:opacity-60"
              >
                {pwSaving ? t('portal.farmer.common.saving') : t('portal.farmer.account.changePassword')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmerAccountPage

