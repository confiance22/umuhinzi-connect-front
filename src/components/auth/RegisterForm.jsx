/**
 * RegisterForm — 3-step registration:
 *   1. Account type (Farmer or Buyer) — must be chosen first.
 *   2. Your details.
 *   3. Security & policy.
 *
 * The role cards were previously part of the details step and defaulted to
 * farmer. They are now the first step with no default, so every account has an
 * explicit, intentional role before the user can continue.
 */
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '../../api/authApi'
import { useAuth } from '../../hooks/useAuth'
import { useToastContext } from '../../context/ToastContext'
import { roleHome } from '../../utils/roles'
import ButtonLoader from '../common/ButtonLoader'
import { ROUTE_PATHS } from '../../constants/routePaths'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const MIN_LOADER_MS = 600

const inputClass =
  'w-full rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3.5 text-sm text-ink placeholder-gray-400 outline-none transition-all focus:border-brand-600 focus:bg-white focus:ring-4 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-[#16a34a]/60 dark:focus:bg-white/10 dark:focus:ring-[#16a34a]/30'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const STEPS = [
  { id: 1, label: 'Account type' },
  { id: 2, label: 'Your details' },
  { id: 3, label: 'Security' }
]

const STEP_COPY = {
  1: {
    title: 'Choose your account type',
    subtitle: 'Select how you want to use Umuhinzi Connect to get started.'
  },
  2: {
    title: 'Tell us about you',
    subtitle: 'Add your contact and location details so we can set up your account.'
  },
  3: {
    title: 'Secure your account',
    subtitle: 'Create a strong password and accept our terms.'
  }
}

function getPasswordStrength(pwd = '') {
  const hasMinLength = pwd.length >= 8
  const hasUpper = /[A-Z]/.test(pwd)
  const hasLower = /[a-z]/.test(pwd)
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)

  let score = 0
  if (hasMinLength) score++
  if (hasUpper) score++
  if (hasLower) score++
  if (hasNumberOrSymbol) score++

  const isStrong = hasMinLength && hasUpper && hasLower && hasNumberOrSymbol

  return {
    score,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumberOrSymbol,
    isStrong
  }
}

export default function RegisterForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToastContext()
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
  } = useForm({ mode: 'onTouched' })

  const [formStep, setFormStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const password = watch('password') || ''
  const selectedRole = watch('role')
  const passwordStrength = getPasswordStrength(password)

  const goToStep = (nextStep) => {
    setErrorMessage('')
    setDirection(nextStep < formStep ? -1 : 1)
    setFormStep(nextStep)
  }

  const handleAccountTypeContinue = async () => {
    setErrorMessage('')
    const isValid = await trigger('role')
    if (isValid) {
      setDirection(1)
      setFormStep(2)
    }
  }

  const handleDetailsContinue = async () => {
    setErrorMessage('')
    const isValid = await trigger(['fullName', 'phone', 'email', 'district', 'sector'])
    if (isValid) {
      setDirection(1)
      setFormStep(3)
    }
  }

  const handleFormKeyDown = (event) => {
    if (event.key !== 'Enter' || formStep === 3) return
    event.preventDefault()
    if (formStep === 1) handleAccountTypeContinue()
    if (formStep === 2) handleDetailsContinue()
  }

  const onSubmit = async (data) => {
    if (!data.role) {
      setErrorMessage('Choose whether you are a farmer or a buyer first.')
      setFormStep(1)
      return
    }

    if (!passwordStrength.isStrong) {
      setErrorMessage('Please create a strong password matching all requirements before continuing.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    const startedAt = Date.now()

    try {
      const payload = {
        full_name: data.fullName.trim(),
        phone: data.phone.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
        district: data.district?.trim() || null,
        sector: data.sector?.trim() || null
      }

      const response = await authApi.register(payload)
      const remaining = MIN_LOADER_MS - (Date.now() - startedAt)
      if (remaining > 0) await sleep(remaining)

      const authUser = {
        id: response.id,
        full_name: response.full_name,
        name: response.name || response.full_name,
        phone: response.phone,
        email: response.email,
        role: response.role,
        district: response.district,
        sector: response.sector
      }

      login(response.token, authUser)
      const firstName = (authUser.name || authUser.phone || 'there').split(/[\s@_.]+/).filter(Boolean)[0] || 'there'
      showToast(`Welcome to Umuhinzi Connect, ${firstName}!`, 'success')
      navigate(roleHome(authUser.role), { replace: true })
    } catch (error) {
      const remaining = MIN_LOADER_MS - (Date.now() - startedAt)
      if (remaining > 0) await sleep(remaining)
      setErrorMessage(error?.message || 'Could not create your account')
    } finally {
      setIsSubmitting(false)
    }
  }

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0
    })
  }

  return (
    <div className="w-full max-w-md mx-auto font-sans">
      {/* 3-Step Progress Indicator */}
      <div className="mb-7">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 z-0 h-[2px] -translate-y-1/2 bg-black/[0.08] dark:bg-white/10" />
          <div
            className={`absolute top-1/2 left-0 -translate-y-1/2 h-[2px] transition-all duration-500 z-0 bg-emerald-500 ${
              formStep === 1 ? 'w-0' : formStep === 2 ? 'w-1/2' : 'w-full'
            }`}
          />

          {STEPS.map((step) => {
            const complete = formStep > step.id
            const active = formStep === step.id
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => formStep > step.id && goToStep(step.id)}
                  disabled={formStep <= step.id}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm ${
                    complete
                      ? 'bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700'
                      : active
                        ? 'bg-[#16a34a] text-white ring-4 ring-[#16a34a]/20 scale-105'
                        : 'bg-black/[0.06] text-muted dark:bg-white/10 dark:text-gray-400'
                  } disabled:cursor-default`}
                  aria-current={active ? 'step' : undefined}
                >
                  {complete ? (
                    <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </button>
                <span
                  className={`text-[10px] sm:text-xs font-medium tracking-[0.12em] uppercase whitespace-nowrap transition-colors ${
                    active || complete ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className="space-y-5">
        <div className="space-y-1 mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">
            {STEP_COPY[formStep].title}
          </h1>
          <p className="text-sm text-muted dark:text-gray-400">{STEP_COPY[formStep].subtitle}</p>
        </div>

        {errorMessage && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs font-medium text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        )}

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {formStep === 1 && (
            <motion.div
              key="step-role"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-2">
                <label
                  title="Sell your harvest directly to buyers."
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all active:scale-[0.99] ${
                    selectedRole === 'farmer'
                      ? 'border-brand-600 bg-brand-600 text-white shadow-[0_8px_24px_-14px_rgba(22,163,74,0.8)]'
                      : 'border-black/10 bg-black/[0.03] text-ink/75 hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-brand-400/40 dark:hover:bg-brand-500/10 dark:hover:text-brand-300'
                  }`}
                >
                  <input
                    type="radio"
                    value="farmer"
                    {...register('role', { required: 'Choose an account type' })}
                    className="sr-only"
                  />
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 21c8 0 14-6 14-14V5h-2C9 5 3 11 3 19v2h2zm0 0c0-5 4-9 9-10"
                    />
                  </svg>
                  Farmer
                </label>

                <label
                  title="Source fresh produce from local farmers."
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all active:scale-[0.99] ${
                    selectedRole === 'buyer'
                      ? 'border-brand-600 bg-brand-600 text-white shadow-[0_8px_24px_-14px_rgba(22,163,74,0.8)]'
                      : 'border-black/10 bg-black/[0.03] text-ink/75 hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-brand-400/40 dark:hover:bg-brand-500/10 dark:hover:text-brand-300'
                  }`}
                >
                  <input
                    type="radio"
                    value="buyer"
                    {...register('role', { required: 'Choose an account type' })}
                    className="sr-only"
                  />
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l2.4 12.3a2 2 0 002 1.7h9.2a2 2 0 002-1.6L22 7H6"
                    />
                    <circle cx="9" cy="20" r="1.5" />
                    <circle cx="18" cy="20" r="1.5" />
                  </svg>
                  Buyer
                </label>
              </div>

              {errors.role && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.role.message}</p>
              )}
              {!selectedRole && (
                <p className="text-center text-xs text-muted dark:text-gray-500">
                  Select Farmer or Buyer to continue.
                </p>
              )}

              <button
                type="button"
                onClick={handleAccountTypeContinue}
                disabled={!selectedRole}
                className={`auth-button w-full py-3.5 text-white text-sm font-medium rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 mt-2 ${
                  !selectedRole ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <span>Continue</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </motion.div>
          )}

          {formStep === 2 && (
            <motion.div
              key="step-details"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between rounded-2xl border border-[#16a34a]/30 bg-[#16a34a]/10 px-4 py-3">
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                    Account type
                  </span>
                  <p className="text-sm font-semibold text-ink dark:text-white">
                    {selectedRole === 'farmer' ? 'Farmer' : 'Buyer'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="text-xs font-semibold text-emerald-700 transition-colors hover:text-ink dark:text-emerald-300 dark:hover:text-white"
                >
                  Change
                </button>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="register-name" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                  Full name
                </label>
                <input
                  id="register-name"
                  {...register('fullName', { required: 'Full name is required' })}
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  className={`${inputClass} ${errors.fullName ? 'border-red-500/60 dark:border-red-500/50' : ''}`}
                />
                {errors.fullName && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.fullName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="register-phone" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                    Phone number
                  </label>
                  <input
                    id="register-phone"
                    {...register('phone', {
                      required: 'Phone number is required',
                      minLength: { value: 10, message: 'At least 10 digits' }
                    })}
                    type="tel"
                    placeholder="+250 78..."
                    autoComplete="tel"
                    className={`${inputClass} ${errors.phone ? 'border-red-500/60 dark:border-red-500/50' : ''}`}
                  />
                  {errors.phone && (
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-email" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    id="register-email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: EMAIL_RE, message: 'Enter a valid email' }
                    })}
                    type="email"
                    placeholder="you@example.rw"
                    autoComplete="email"
                    className={`${inputClass} ${errors.email ? 'border-red-500/60 dark:border-red-500/50' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="register-district" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                    District
                  </label>
                  <input
                    id="register-district"
                    {...register('district')}
                    type="text"
                    placeholder="e.g. Musanze"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-sector" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                    Sector
                  </label>
                  <input
                    id="register-sector"
                    {...register('sector')}
                    type="text"
                    placeholder="e.g. Kinigi"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="flex w-1/3 items-center justify-center gap-1.5 rounded-2xl bg-black/[0.03] py-3.5 text-sm font-medium text-ink/75 transition-all duration-200 hover:bg-black/[0.06] active:scale-[0.99] dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleDetailsContinue}
                  className="auth-button w-2/3 py-3.5 text-white text-sm font-medium rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {formStep === 3 && (
            <motion.div
              key="step-security"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="register-password" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                    Password
                  </label>
                  <span className="text-xs font-medium text-muted dark:text-gray-400">Min. 8 characters</span>
                </div>
                <div className="relative">
                  <input
                    id="register-password"
                    {...register('password', {
                      required: 'Password is required',
                      validate: (val) =>
                        getPasswordStrength(val).isStrong ||
                        'Must be at least 8 chars with uppercase, lowercase, and a number or symbol'
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    className={`${inputClass} pr-11 ${errors.password ? 'border-red-500/60 dark:border-red-500/50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {password && (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-1.5 h-1.5">
                      <div
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 1
                            ? passwordStrength.score <= 2
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                            : 'bg-black/10 dark:bg-white/10'
                        }`}
                      />
                      <div
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 2
                            ? passwordStrength.score <= 2
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                            : 'bg-black/10 dark:bg-white/10'
                        }`}
                      />
                      <div
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 3
                            ? passwordStrength.score === 3
                              ? 'bg-emerald-400'
                              : 'bg-emerald-500'
                            : 'bg-black/10 dark:bg-white/10'
                        }`}
                      />
                      <div
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength.score === 4 ? 'bg-emerald-600' : 'bg-black/10 dark:bg-white/10'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span
                        className={`flex items-center gap-1 ${
                          passwordStrength.hasMinLength ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-muted dark:text-gray-400'
                        }`}
                      >
                        {passwordStrength.hasMinLength ? '✓' : '•'} 8+ characters
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          passwordStrength.hasUpper ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-muted dark:text-gray-400'
                        }`}
                      >
                        {passwordStrength.hasUpper ? '✓' : '•'} Uppercase (A-Z)
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          passwordStrength.hasLower ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-muted dark:text-gray-400'
                        }`}
                      >
                        {passwordStrength.hasLower ? '✓' : '•'} Lowercase (a-z)
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          passwordStrength.hasNumberOrSymbol ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-muted dark:text-gray-400'
                        }`}
                      >
                        {passwordStrength.hasNumberOrSymbol ? '✓' : '•'} Number or symbol
                      </span>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="register-confirm" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                  Repeat password
                </label>
                <div className="relative">
                  <input
                    id="register-confirm"
                    {...register('confirmPassword', {
                      required: 'Please repeat your password',
                      validate: (value) => value === password || 'Passwords do not match'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className={`${inputClass} pr-11 ${errors.confirmPassword ? 'border-red-500/60 dark:border-red-500/50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={showConfirmPassword ? 'Hide repeat password' : 'Show repeat password'}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('agreeTerms', {
                      required: 'You must agree to the Terms & Privacy Policy to register'
                    })}
                    className="mt-1 h-4 w-4 cursor-pointer rounded border-black/15 bg-black/[0.03] text-[#16a34a] accent-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30 dark:border-white/20 dark:bg-white/5"
                  />
                  <span className="text-xs leading-snug text-muted dark:text-gray-400">
                    I agree to Umuhinzi Connect’s{' '}
                    <span className="font-semibold text-ink underline underline-offset-2 dark:text-white">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="font-semibold text-ink underline underline-offset-2 dark:text-white">
                      Privacy Policy
                    </span>
                    . (Required)
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-1">
                    {errors.agreeTerms.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  disabled={isSubmitting}
                  className="flex w-1/3 items-center justify-center gap-1.5 rounded-2xl bg-black/[0.03] py-3.5 text-sm font-medium text-ink/75 transition-all duration-200 hover:bg-black/[0.06] active:scale-[0.99] dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className={`auth-button w-2/3 py-3.5 text-white text-sm font-medium rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed ${
                    isSubmitting ? 'opacity-95' : ''
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2.5 min-h-[20px]">
                    {isSubmitting && <ButtonLoader size={18} className="text-white" />}
                    <span className={isSubmitting ? 'opacity-90' : ''}>
                      {isSubmitting ? 'Creating account...' : 'Create account'}
                    </span>
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="pt-2 text-center text-sm text-muted dark:text-gray-400">
          Already have an account?{' '}
          <Link to={ROUTE_PATHS.LOGIN} className="font-semibold text-ink hover:underline dark:text-white">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
