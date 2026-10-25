/**
 * ForgotPasswordForm — 3-step OTP password reset.
 *
 * Step 1 (email):    authApi.requestPasswordReset(email)
 * Step 2 (otp):      authApi.verifyPasswordResetOtp(email, otp) → { resetToken }
 * Step 3 (new):      authApi.resetPassword({ resetToken, newPassword, confirmPassword })
 * On success → /login with state.passwordReset → login shows a success banner.
 */
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import ButtonLoader from '../common/ButtonLoader'
import OtpInput from '../common/OtpInput'
import { ROUTE_PATHS } from '../../constants/routePaths'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const MIN_LOADER_MS = 600

const inputClass =
  'w-full rounded-2xl border border-black/10 bg-black/[0.03] py-3.5 pl-11 pr-4 text-sm text-ink placeholder-gray-400 outline-none transition-all focus:border-brand-600 focus:bg-white focus:ring-4 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-[#16a34a]/60 dark:focus:bg-white/10 dark:focus:ring-[#16a34a]/30'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordForm() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const [step, setStep] = useState('email') // 'email' | 'otp' | 'new'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [otpStatus, setOtpStatus] = useState('idle')

  const newPassword = watch('newPassword')

  const gotoStep = (nextStep, message, isError = false) => {
    if (isError) {
      setErrorMessage(message)
      setInfoMessage('')
    } else {
      setInfoMessage(message)
      setErrorMessage('')
    }
    setStep(nextStep)
    setOtpStatus('idle')
  }

  const onEmailSubmit = async ({ email }) => {
    setIsSubmitting(true)
    setErrorMessage('')
    setInfoMessage('')
    const startedAt = Date.now()
    try {
      const normalized = email.trim().toLowerCase()
      const response = await authApi.requestPasswordReset(normalized)
      const remaining = MIN_LOADER_MS - (Date.now() - startedAt)
      if (remaining > 0) await sleep(remaining)
      setPendingEmail(normalized)
      const devNote = response?.dev_otp ? ` Dev code: ${response.dev_otp}` : ''
      gotoStep(
        'otp',
        `If an account exists for that email, we sent a 6-digit reset code.${devNote}`
      )
    } catch (error) {
      const remaining = MIN_LOADER_MS - (Date.now() - startedAt)
      if (remaining > 0) await sleep(remaining)
      // Keep the response surface the same even if the email is unknown.
      setPendingEmail(email.trim().toLowerCase())
      gotoStep('otp', 'If an account exists for that email, we sent a 6-digit reset code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const executeOtpVerification = async (code) => {
    if (!pendingEmail || code.length < 6) return
    setIsSubmitting(true)
    setErrorMessage('')
    setOtpStatus('idle')
    try {
      const response = await authApi.verifyPasswordResetOtp(pendingEmail, code)
      setOtpStatus('success')
      setResetToken(response.resetToken)
      setTimeout(() => gotoStep('new', 'Code verified. Choose a new password.'), 800)
    } catch (error) {
      setOtpStatus('error')
      setErrorMessage(error?.message || 'That code is not valid or has expired')
      setTimeout(() => setOtpStatus('idle'), 500)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!pendingEmail) return
    setErrorMessage('')
    setOtpStatus('idle')
    try {
      const response = await authApi.requestPasswordReset(pendingEmail)
      const devNote = response?.dev_otp ? ` Dev code: ${response.dev_otp}` : ''
      setInfoMessage(`A new code has been sent.${devNote}`)
    } catch (error) {
      setErrorMessage(error?.message || 'Could not resend the code')
    }
  }

  const onNewPasswordSubmit = async ({ newPassword, confirmPassword }) => {
    setIsSubmitting(true)
    setErrorMessage('')
    setInfoMessage('')
    const startedAt = Date.now()
    try {
      await authApi.resetPassword({ resetToken, newPassword, confirmPassword })
      const remaining = MIN_LOADER_MS - (Date.now() - startedAt)
      if (remaining > 0) await sleep(remaining)
      setTimeout(
        () => navigate(ROUTE_PATHS.LOGIN, { replace: true, state: { passwordReset: true } }),
        1600
      )
      setInfoMessage('Password updated. Redirecting to sign in...')
    } catch (error) {
      const remaining = MIN_LOADER_MS - (Date.now() - startedAt)
      if (remaining > 0) await sleep(remaining)
      setErrorMessage(error?.message || 'Could not reset your password')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Step 3: choose a new password ---
  if (step === 'new') {
    return (
      <div className="w-full max-w-md mx-auto font-sans">
        <form onSubmit={handleSubmit(onNewPasswordSubmit)} className="space-y-5">
          <div className="space-y-1.5 mb-8">
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted dark:text-gray-400">Reset password</h3>
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">Choose a new password</h1>
            <p className="text-sm text-muted dark:text-gray-400">For <span className="font-semibold text-ink dark:text-white">{pendingEmail}</span></p>
          </div>

          {infoMessage && (
            <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              {infoMessage}
            </p>
          )}
          {errorMessage && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          )}

          <div className="space-y-1.5">
            <label htmlFor="reset-new" className="text-sm font-medium text-ink/80 dark:text-gray-300">New password</label>
            <input
              id="reset-new"
              {...register('newPassword', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className={`${inputClass} ${errors.newPassword ? 'border-red-500/60 dark:border-red-500/50' : ''}`}
            />
            {errors.newPassword && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.newPassword.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reset-confirm" className="text-sm font-medium text-ink/80 dark:text-gray-300">Confirm password</label>
            <input
              id="reset-confirm"
              {...register('confirmPassword', {
                required: 'Please repeat your password',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
              type="password"
              placeholder="Repeat your new password"
              autoComplete="new-password"
              className={`${inputClass} ${errors.confirmPassword ? 'border-red-500/60 dark:border-red-500/50' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={`auth-button w-full py-3.5 text-white text-sm font-medium rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed ${isSubmitting ? 'opacity-95' : ''}`}
          >
            <span className="inline-flex items-center justify-center gap-2.5 min-h-[20px]">
              {isSubmitting && <ButtonLoader size={18} className="text-white" />}
              <span className={isSubmitting ? 'opacity-90' : ''}>{isSubmitting ? 'Updating...' : 'Reset password'}</span>
            </span>
          </button>

          <p className="pt-2 text-center text-sm text-muted dark:text-gray-400">
            Remembered it?{' '}
            <Link to={ROUTE_PATHS.LOGIN} className="font-semibold text-ink hover:underline dark:text-white">
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    )
  }

  // --- Step 2: OTP ---
  if (step === 'otp') {
    return (
      <div className="w-full max-w-md mx-auto font-sans">
        <div className="space-y-7">
          <div className="space-y-1.5">
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted dark:text-gray-400">Reset your password</h3>
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">Check your email</h1>
            <p className="pt-1 text-sm leading-relaxed text-muted dark:text-gray-400">
              Enter the 6-digit code sent to{' '}
              <span className="break-all font-semibold text-ink dark:text-white">{pendingEmail}</span>
            </p>
          </div>

          {infoMessage && (
            <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              {infoMessage}
            </p>
          )}
          {errorMessage && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          )}

          <OtpInput
            status={otpStatus}
            disabled={isSubmitting}
            onComplete={executeOtpVerification}
            onResend={handleResend}
          />

          <div className="flex flex-col gap-3 border-t border-black/10 pt-6 dark:border-white/10">
            <button
              type="button"
              onClick={() => gotoStep('email', '')}
              className="mx-auto flex items-center justify-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-ink dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Use a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- Step 1: email ---
  return (
    <div className="w-full max-w-md mx-auto font-sans">
      <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-5">
        <div className="space-y-1.5 mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">Forgot your password?</h1>
          <p className="text-sm leading-relaxed text-muted dark:text-gray-400">
            No stress. Enter the email linked to your Umuhinzi Connect account and we'll send a one-time security code to reset it.
          </p>
        </div>

        {errorMessage && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="reset-email" className="text-sm font-medium text-ink/80 dark:text-gray-300">Email</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
              </svg>
            </span>
            <input
              id="reset-email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: EMAIL_RE, message: 'Enter a valid email' },
              })}
              type="email"
              placeholder="you@example.rw"
              autoComplete="email"
              className={`${inputClass} ${errors.email ? 'border-red-500/60 dark:border-red-500/50' : ''}`}
            />
          </div>
          {errors.email && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className={`auth-button w-full py-3.5 text-white text-sm font-medium rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed ${isSubmitting ? 'opacity-95' : ''}`}
        >
          <span className="inline-flex items-center justify-center gap-2.5 min-h-[20px]">
            {isSubmitting && <ButtonLoader size={18} className="text-white" />}
            <span className={isSubmitting ? 'opacity-90' : ''}>
              {isSubmitting ? 'Sending code...' : 'Send reset code'}
            </span>
          </span>
        </button>

        <p className="pt-2 text-center text-sm text-muted dark:text-gray-400">
          Remembered it?{' '}
          <Link to={ROUTE_PATHS.LOGIN} className="font-semibold text-ink hover:underline dark:text-white">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  )
}