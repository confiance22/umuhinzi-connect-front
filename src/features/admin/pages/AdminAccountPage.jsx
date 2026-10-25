/**
 * AdminAccountPage — signed-in Super Admin's profile (Soma admin account port).
 * Profile Overview (read-only) + Change Password tabs. Password changes are
 * written straight to the backend (POST /admin/me/password).
 */
import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthContext } from '../../../context/AuthContext'
import { useToastContext } from '../../../context/ToastContext'
import { adminApi } from '../../../api/adminApi'
import { workerApi } from '../../../api/workerApi'
import UsernameField, { usernameValid } from '../../../components/common/UsernameField'
import { ROLE_LABELS, ROLES } from '../../../constants/roles'

const initialsOf = (name) =>
  (name || 'User')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const detailLabelClass = 'block text-xs text-muted mb-1'
const fieldLabelClass = 'block text-sm font-medium text-ink mb-1.5'
const inputClass =
  'h-11 w-full rounded-lg bg-white border border-line px-3.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all'

const DetailCard = ({ label, value }) => (
  <div className="rounded-xl bg-page border border-line px-4 py-3.5">
    <p className={detailLabelClass}>{label}</p>
    <p className="text-sm font-semibold text-ink truncate">{value || '—'}</p>
  </div>
)

const EyeIcon = ({ shown }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
    {shown ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    )}
  </svg>
)

const TABS = [
  {
    id: 'overview',
    label: 'Profile Overview',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  },
  {
    id: 'password',
    label: 'Change Password',
    icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
  },
]

export const AdminAccountPage = () => {
  const { user, setUser } = useAuthContext()
  const { showToast } = useToastContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabFromUrl = searchParams.get('tab')
  const activeTab = TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : 'overview'
  const setTab = (id) => setSearchParams(id === 'overview' ? {} : { tab: id }, { replace: true })

  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [pwShow, setPwShow] = useState({ old: false, next: false, confirm: false })
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const [username, setUsername] = useState(user?.username || '')
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  const handleSaveUsername = async (e) => {
    e.preventDefault()
    setUsernameError('')
    const next = String(username || '').trim()
    if (!usernameValid(next)) {
      setUsernameError('Use 3–30 letters, numbers, dots, dashes or underscores.')
      return
    }
    if (next.toLowerCase() === String(user?.username || '').toLowerCase()) return
    setUsernameSaving(true)
    try {
      const updated =
        user?.role === ROLES.SHOP_MANAGER
          ? await workerApi.updateSelf({ username: next })
          : await adminApi.updateSelf({ username: next })
      setUser({ ...user, ...updated })
      setUsername(updated.username || next)
      showToast('Username updated. Sign in with it from now on.', 'success')
    } catch (err) {
      setUsernameError(err?.message || 'Could not update your username')
    } finally {
      setUsernameSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    if (pwForm.newPassword.length < 8) {
      setPwError('Password must be at least 8 characters')
      return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match')
      return
    }
    setPwLoading(true)
    try {
      await adminApi.changePassword({ currentPassword: pwForm.oldPassword, newPassword: pwForm.newPassword })
      showToast('Password changed successfully', 'success')
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setPwShow({ old: false, next: false, confirm: false })
      setTab('overview')
    } catch (err) {
      setPwError(err?.message || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  const primaryRoleLabel = ROLE_LABELS[user?.role] || 'Super Admin'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-5">
        <span className="w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-brand-600 to-brand-700 text-white text-xl font-bold flex items-center justify-center shrink-0 shadow-lg shadow-brand-700/40">
          {initialsOf(user?.name || user?.username)}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl leading-tight truncate">
            {user?.name || user?.username || 'Administrator'}
          </h1>
          <p className="text-sm text-muted mt-1 flex items-center gap-1.5 truncate">
            <svg className="w-4 h-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Platform Administrator · {primaryRoleLabel}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-line shadow-soft overflow-hidden">
        <div className="bg-page border-b border-line p-2 flex items-center gap-1.5 overflow-x-auto">
          {TABS.map((t) => {
            const active = activeTab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-[transform,background-color,color] duration-150 whitespace-nowrap active:scale-[0.98] ${
                  active ? 'bg-ink text-white' : 'text-gray-500 hover:text-ink hover:bg-white'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                </svg>
                {t.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="p-6 sm:p-8 space-y-5" key="overview">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">Personal details</h2>
              <p className="text-sm text-gray-400 mt-0.5">Your platform console account identity.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailCard label="Full Name" value={user?.name} />
              <DetailCard label="Email Address" value={user?.email} />
              <DetailCard label="Username" value={user?.username} />
              <DetailCard label="Shop ID" value={user?.shopId} />
              <DetailCard label="Role" value={primaryRoleLabel} />
            </div>

            <form
              onSubmit={handleSaveUsername}
              className="border-t border-line pt-5 flex flex-col sm:flex-row sm:items-end gap-4"
            >
              <div className="flex-1">
                <UsernameField
                  value={username}
                  onChange={setUsername}
                  currentUsername={user?.username}
                  excludeId={user?.id}
                  label="Edit sign-in username"
                  hint="Your username (or email) is what you type at sign-in. You can change it any time — it must be unique."
                />
              </div>
              <button
                type="submit"
                disabled={
                  usernameSaving ||
                  !usernameValid(String(username || '').trim()) ||
                  String(username || '').trim().toLowerCase() === String(user?.username || '').toLowerCase()
                }
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-brand-700 text-white hover:bg-brand-800 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
              >
                {usernameSaving ? 'Saving…' : 'Save username'}
              </button>
            </form>
            {usernameError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
                {usernameError}
              </p>
            )}
          </div>
        )}

        {activeTab === 'password' && (
          <div className="p-6 sm:p-8" key="password">
            <div className="mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-ink">Change password</h2>
              <p className="text-sm text-gray-400 mt-0.5">Update your credentials to keep the console secure.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className={fieldLabelClass}>Current Password</label>
                <div className="relative">
                  <input
                    type={pwShow.old ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={pwForm.oldPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, oldPassword: e.target.value }))}
                    required
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setPwShow((p) => ({ ...p, old: !p.old }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={pwShow.old ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon shown={pwShow.old} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={fieldLabelClass}>New Password</label>
                  <div className="relative">
                    <input
                      type={pwShow.next ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                      required
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setPwShow((p) => ({ ...p, next: !p.next }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={pwShow.next ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon shown={pwShow.next} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={fieldLabelClass}>Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={pwShow.confirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      required
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setPwShow((p) => ({ ...p, confirm: !p.confirm }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={pwShow.confirm ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon shown={pwShow.confirm} />
                    </button>
                  </div>
                </div>
              </div>

              {pwError && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{pwError}</p>}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium bg-brand-700 text-white hover:bg-brand-800 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                >
                  {pwLoading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAccountPage
