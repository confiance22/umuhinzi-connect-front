/**
 * LoginForm — email/password sign-in with optional OTP/2FA step (rebranded &
 * adapted from Soma Connect's LoginForm).
 *
 * Flow:
 *   1. react-hook-form validation → authApi.login({ email, password })
 *   2. If response.otpRequired → show OtpInput step, verify via authApi.verifyOtp
 *   3. AuthContext.login(token, user) → redirect to ?next= or role dashboard
 */
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import { useAuth } from '../../hooks/useAuth'
import { useToastContext } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'
import { dashboardPathForRoles } from '../../utils/dashboardPath'
import ButtonLoader from '../common/ButtonLoader'
import OtpInput from '../common/OtpInput'
import { ROUTE_PATHS } from '../../constants/routePaths'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const MIN_LOADER_MS = 600

const inputBaseClass =
  'w-full rounded-2xl border bg-black/[0.03] py-3.5 pl-11 pr-4 text-sm text-ink placeholder-gray-400 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-brand-500/20 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:bg-white/10 dark:focus:ring-[#16a34a]/30'
const inputOkClass =
  'border-black/10 focus:border-brand-600 dark:border-white/10 dark:focus:border-[#16a34a]/60'
const inputErrorClass = 'border-red-500/60 dark:border-red-500/50'

export default function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { showToast } = useToastContext()
  const { t } = useLanguage()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [otpRequired, setOtpRequired] = useState(false)
  const [pendingUsername, setPendingUsername] = useState('')
  const [otpStatus, setOtpStatus] = useState('idle')

  const successMessage = location.state?.registered
    ? t('auth.login.registered')
    : location.state?.passwordReset
    ? t('auth.login.passwordReset')
    : ''

  const saveAuthAndRedirect = (response) => {
    if (!response?.token) {
      throw new Error(t('auth.login.errors.missingToken'))
    }

    const { token, ...profile } = response
    const authUser = {
      ...profile,
      name: response.name || response.full_name || response.username || response.email || response.phone,
      username: response.username || response.phone || null,
      role: response.role || 'farmer',
    }

    login(token, authUser)

    const firstName = (authUser.name || authUser.email || 'there').split(/[\s@_.]+/).filter(Boolean)[0] || 'there'
    showToast(t('auth.login.welcomeToast').replace('{name}', firstName), 'success')

    // A ?next= deep link wins; otherwise land on the role's dashboard.
    const next = new URLSearchParams(location.search).get('next')
    navigate(next || dashboardPathForRoles(authUser), { replace: true })
  }

  const onSubmit = async ({ phone, password }) => {
    setIsSubmitting(true)
    setErrorMessage('')
    const startedAt = Date.now()
    try {
      const response = await authApi.login({ phone, password })
      const remaining = MIN_LOADER_MS - (Date.now() - startedAt)
      if (remaining > 0) await sleep(remaining)

      if (response?.otpRequired) {
        setOtpRequired(true)
        setPendingUsername(response.username || phone)
        setOtpStatus('idle')
        setIsSubmitting(false)
        return
      }

      saveAuthAndRedirect(response)
    } catch (error) {
      const remaining = MIN_LOADER_MS - (Date.now() - startedAt)
      if (remaining > 0) await sleep(remaining)
      setErrorMessage(error?.message || t('auth.login.errors.unable'))
      setIsSubmitting(false)
    }
  }

  const executeOtpVerification = async (code) => {
    if (!pendingUsername || code.length < 6) return
    setIsSubmitting(true)
    setErrorMessage('')
    setOtpStatus('idle')
    try {
      const response = await authApi.verifyOtp(pendingUsername, code)
      setOtpStatus('success')
      setTimeout(() => saveAuthAndRedirect(response), 800)
    } catch (error) {
      setOtpStatus('error')
      setErrorMessage(error?.message || t('auth.login.errors.otpFailed'))
      setTimeout(() => setOtpStatus('idle'), 500)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!pendingUsername) return
    setErrorMessage('')
    setOtpStatus('idle')
    try {
      await authApi.resendOtp(pendingUsername)
    } catch (error) {
      setErrorMessage(error?.message || t('auth.login.errors.resend'))
    }
  }

  const backToLogin = () => {
    setOtpRequired(false)
    setOtpStatus('idle')
    setErrorMessage('')
  }

  return (
    <div className="w-full max-w-md mx-auto font-sans">
      {!otpRequired ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">{t('auth.login.title')}</h1>
            <p className="text-sm text-muted dark:text-gray-400">{t('auth.login.subtitle')}</p>
          </div>

          {successMessage && (
            <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              {successMessage}
            </p>
          )}

          {errorMessage && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          )}

          <div className="space-y-1.5">
            <label htmlFor="login-phone" className="text-sm font-medium text-ink/80 dark:text-gray-300">{t('auth.login.phoneLabel')}</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.2 3.6a1 1 0 01-.26 1.03L7.7 9.8a16 16 0 006.5 6.5l1.49-1.47a1 1 0 011.03-.26l3.6 1.2a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
                </svg>
              </span>
              <input
                id="login-phone"
                {...register('phone', { required: t('auth.login.phoneRequired') })}
                type="tel"
                placeholder={t('auth.login.phonePlaceholder')}
                autoComplete="tel"
                className={`${inputBaseClass} ${errors.phone ? inputErrorClass : inputOkClass}`}
              />
            </div>
            {errors.phone && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium text-ink/80 dark:text-gray-300">{t('auth.login.passwordLabel')}</label>
              <Link
                to={ROUTE_PATHS.FORGOT_PASSWORD}
                className="text-sm font-medium text-muted transition-colors hover:text-ink dark:text-gray-400 dark:hover:text-white"
              >
                {t('auth.login.forgot')}
              </Link>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="login-password"
                {...register('password', { required: t('auth.login.passwordRequired') })}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`${inputBaseClass} pr-11 ${errors.password ? inputErrorClass : inputOkClass}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink focus:outline-none dark:text-gray-400 dark:hover:text-white"
                aria-label={showPassword ? t('auth.common.hidePassword') : t('auth.common.showPassword')}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.password.message}</p>}
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
            <input type="checkbox" className="peer sr-only" />
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-black/15 bg-black/[0.03] text-transparent transition-all duration-150 peer-checked:border-[#16a34a] peer-checked:bg-[#16a34a] peer-checked:text-white dark:border-white/20 dark:bg-white/5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-sm text-muted dark:text-gray-400">{t('auth.login.keepLoggedIn')}</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={`auth-button w-full py-3.5 text-white text-sm font-medium rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed ${isSubmitting ? 'opacity-95' : ''}`}
          >
            <span className="inline-flex items-center justify-center gap-2.5 min-h-[20px]">
              {isSubmitting && <ButtonLoader size={18} className="text-white" />}
              <span className={isSubmitting ? 'opacity-90' : ''}>
                {isSubmitting ? t('auth.login.signingIn') : t('auth.login.signIn')}
              </span>
            </span>
          </button>

          <p className="pt-4 text-center text-sm text-muted dark:text-gray-400">
            {t('auth.login.noAccount')}{' '}
            <Link to={ROUTE_PATHS.REGISTER} className="font-semibold text-ink hover:underline dark:text-white">
              {t('auth.login.createAccount')}
            </Link>
          </p>
        </form>
      ) : (
        // --- OTP / 2FA verification step ---
        <div className="space-y-7">
          <div className="space-y-1.5">
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted dark:text-gray-400">
              {t('auth.login.twoFactor')}
            </h3>
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">
              {t('auth.login.securityTitle')}
            </h1>
            <p className="pt-1 text-sm leading-relaxed text-muted dark:text-gray-400">
              {t('auth.login.codeSent')}{' '}
              <span className="break-all font-semibold text-ink dark:text-white">{pendingUsername}</span>
            </p>
          </div>

          <OtpInput
            status={otpStatus}
            disabled={isSubmitting}
            onComplete={executeOtpVerification}
            onResend={handleResend}
          />

          {errorMessage && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          )}

          <div className="border-t border-black/10 pt-6 dark:border-white/10">
            <button
              type="button"
              onClick={backToLogin}
              className="mx-auto flex items-center justify-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-ink dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('auth.login.backToLogin')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}