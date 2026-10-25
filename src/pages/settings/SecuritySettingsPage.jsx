/**
 * SecuritySettingsPage — Shop Manager: password change (POST /workers/me/password)
 * plus two-factor OTP on login and active session overview.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToastContext } from '../../context/ToastContext'
import { workerApi } from '../../api/workerApi'
import { ActiveSessions } from '../../components/settings/ActiveSessions'

const inputClass =
  'h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all'

export const SecuritySettingsPage = () => {
  const { user, setUser } = useAuth()
  const { showToast } = useToastContext()

  const [pwdCurrent, setPwdCurrent] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdConfirm, setPwdConfirm] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState(false)

  const [otpEnabled, setOtpEnabled] = useState(user?.otpEnabled ?? false)
  const [otpSaving, setOtpSaving] = useState(false)

  useEffect(() => {
    setOtpEnabled(Boolean(user?.otpEnabled ?? false))
  }, [user?.otpEnabled])

  const pwdStrength = useMemo(() => {
    if (!pwdNew) return 0
    let score = 0
    if (pwdNew.length >= 8) score += 1
    if (/[A-Z]/.test(pwdNew)) score += 1
    if (/[0-9]/.test(pwdNew)) score += 1
    if (/[^A-Za-z0-9]/.test(pwdNew)) score += 1
    return score
  }, [pwdNew])

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess(false)

    if (!pwdCurrent) {
      setPwdError('Please enter your current password.')
      return
    }
    if (pwdNew.length < 8) {
      setPwdError('New password must be at least 8 characters.')
      return
    }
    if (pwdStrength < 3) {
      setPwdError('Please choose a stronger password with uppercase, numbers, and symbols.')
      return
    }
    if (pwdNew !== pwdConfirm) {
      setPwdError('New passwords do not match.')
      return
    }

    try {
      await workerApi.changePassword({ currentPassword: pwdCurrent, newPassword: pwdNew })
      setPwdSuccess(true)
      setPwdCurrent('')
      setPwdNew('')
      setPwdConfirm('')
      showToast('Password updated successfully', 'success')
    } catch (err) {
      setPwdError(err?.message || 'Failed to update password.')
    }
  }

  const handleOtpToggle = useCallback(async () => {
    if (user?.role !== 'shop_manager') return
    const next = !otpEnabled
    setOtpSaving(true)
    try {
      await workerApi.updateSelf({ otpEnabled: next })
      setOtpEnabled(next)
      if (setUser) setUser((prev) => ({ ...prev, otpEnabled: next }))
      showToast(next ? 'OTP verification enabled on login' : 'OTP verification disabled on login', 'success')
    } catch (err) {
      showToast(err?.message || 'Could not update OTP setting', 'error')
    } finally {
      setOtpSaving(false)
    }
  }, [otpEnabled, user, setUser, showToast])

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-block text-xs font-medium uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
          Settings · Security & Access
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">Security & Access</h1>
        <p className="text-sm text-muted mt-1">
          Credentials, two-factor verification, and session visibility for your manager account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password */}
        <div className="rounded-2xl border border-line bg-card shadow-soft p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-ink">Change Manager Password</h3>
            <p className="text-xs text-muted mt-0.5">
              Update your credentials. Must be at least 8 characters with numbers and symbols.
            </p>
          </div>

          {pwdError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {pwdError}
            </div>
          )}

          {pwdSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              Password successfully changed!
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Current Password</label>
              <input
                type="password"
                value={pwdCurrent}
                onChange={(e) => setPwdCurrent(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">New Password</label>
              <input
                type="password"
                value={pwdNew}
                onChange={(e) => setPwdNew(e.target.value)}
                className={inputClass}
                placeholder="At least 8 characters"
              />
              {pwdNew && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full transition-colors ${
                          pwdStrength >= step
                            ? pwdStrength === 4
                              ? 'bg-emerald-500'
                              : pwdStrength === 3
                              ? 'bg-teal-500'
                              : 'bg-amber-500'
                            : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted">
                    {pwdStrength < 2 ? 'Weak' : pwdStrength === 3 ? 'Good' : 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={pwdConfirm}
                onChange={(e) => setPwdConfirm(e.target.value)}
                className={inputClass}
                placeholder="Repeat new password"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Sessions & 2FA */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-card shadow-soft p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">Two-Factor OTP on Login</h3>
                <p className="text-xs text-muted mt-0.5">
                  {user?.role === 'super_admin'
                    ? 'Always required — cannot be turned off.'
                    : 'Turn on to require a 6-digit code each time you sign in.'}
                </p>
              </div>
              {user?.role === 'shop_manager' ? (
                <button
                  type="button"
                  onClick={handleOtpToggle}
                  disabled={otpSaving}
                  aria-pressed={otpEnabled}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    otpEnabled ? 'bg-brand-700' : 'bg-gray-300'
                  } ${otpSaving ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <span
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      otpEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                  ENFORCED
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {user?.role === 'super_admin'
                ? 'Super Admin accounts always require OTP verification for security.'
                : otpEnabled
                ? 'Your next login will require a 6-digit verification code sent to your email.'
                : 'When enabled, you will receive a 6-digit code by email each time you sign in.'}
            </p>
          </div>

          <ActiveSessions />
        </div>
      </div>
    </div>
  )
}

export default SecuritySettingsPage