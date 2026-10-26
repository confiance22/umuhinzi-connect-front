/**
 * RegisterForm — 4-step registration:
 *   1. Account type (Farmer or Buyer) — must be chosen first.
 *   2. Your details.
 *   3. Your location (province → district → sector → cell → village).
 *   4. Security & policy.
 *
 * The role cards were previously part of the details step and defaulted to
 * farmer. They are now the first step with no default, so every account has an
 * explicit, intentional role before the user can continue.
 */
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '../../api/authApi'
import { locationApi } from '../../api/locationApi'
import { useAuth } from '../../hooks/useAuth'
import { useToastContext } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'
import { roleHome } from '../../utils/roles'
import ButtonLoader from '../common/ButtonLoader'
import CustomSelect from '../common/CustomSelect'
import { ROUTE_PATHS } from '../../constants/routePaths'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const MIN_LOADER_MS = 600

const inputClass =
  'w-full rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3.5 text-sm text-ink placeholder-gray-400 outline-none transition-all focus:border-brand-600 focus:bg-white focus:ring-4 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-[#16a34a]/60 dark:focus:bg-white/10 dark:focus:ring-[#16a34a]/30'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const STEPS = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
const PROGRESS_WIDTHS = ['w-0', 'w-1/3', 'w-2/3', 'w-full']
const LOCATION_LEVELS = ['districts', 'sectors', 'cells', 'villages']

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
  const { t } = useLanguage()
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    clearErrors,
    formState: { errors }
  } = useForm({ mode: 'onTouched' })

  const [formStep, setFormStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [locationOptions, setLocationOptions] = useState({
    provinces: [],
    districts: [],
    sectors: [],
    cells: [],
    villages: []
  })
  const [loadingLocation, setLoadingLocation] = useState('')
  const [locationError, setLocationError] = useState('')
  const locationRequestRef = useRef(0)

  const stepLabels = t('auth.register.steps')
  const stepCopy = t('auth.register.stepCopy')[formStep - 1]

  const password = watch('password') || ''
  const selectedRole = watch('role')
  const selectedProvince = watch('province_code') || ''
  const selectedDistrict = watch('district_code') || ''
  const selectedSector = watch('sector_code') || ''
  const selectedCell = watch('cell_code') || ''
  const passwordStrength = getPasswordStrength(password)

  const loadLocationOptions = async (level, request, optionsKey) => {
    const requestId = ++locationRequestRef.current
    setLoadingLocation(level)
    setLocationError('')

    try {
      const options = await request()
      if (requestId !== locationRequestRef.current) return
      setLocationOptions((current) => ({ ...current, [optionsKey]: options }))
    } catch (error) {
      if (requestId !== locationRequestRef.current) return
      setLocationOptions((current) => ({ ...current, [optionsKey]: [] }))
      setLocationError(error?.message || t('auth.register.fields.locationError'))
    } finally {
      if (requestId === locationRequestRef.current) setLoadingLocation('')
    }
  }

  const loadProvinces = () =>
    loadLocationOptions('provinces', locationApi.getProvinces, 'provinces')

  useEffect(() => {
    loadProvinces()
  }, [])

  const clearLocationField = (name) => {
    setValue(name, '', { shouldDirty: true })
    clearErrors(name)
  }

  const resetLocationOptions = (keys) => {
    setLocationOptions((current) => {
      const next = { ...current }
      keys.forEach((key) => {
        next[key] = []
      })
      return next
    })
  }

  const handleProvinceChange = (code) => {
    setValue('province_code', code, { shouldValidate: true, shouldDirty: true })
    clearLocationField('district_code')
    clearLocationField('sector_code')
    clearLocationField('cell_code')
    clearLocationField('village_code')
    resetLocationOptions(LOCATION_LEVELS)
    setLocationError('')
    if (code) {
      loadLocationOptions('districts', () => locationApi.getDistricts(code), 'districts')
    }
  }

  const handleDistrictChange = (code) => {
    setValue('district_code', code, { shouldValidate: true, shouldDirty: true })
    clearLocationField('sector_code')
    clearLocationField('cell_code')
    clearLocationField('village_code')
    resetLocationOptions(['sectors', 'cells', 'villages'])
    setLocationError('')
    if (code) {
      loadLocationOptions('sectors', () => locationApi.getSectors(code), 'sectors')
    }
  }

  const handleSectorChange = (code) => {
    setValue('sector_code', code, { shouldValidate: true, shouldDirty: true })
    clearLocationField('cell_code')
    clearLocationField('village_code')
    resetLocationOptions(['cells', 'villages'])
    setLocationError('')
    if (code) {
      loadLocationOptions('cells', () => locationApi.getCells(code), 'cells')
    }
  }

  const handleCellChange = (code) => {
    setValue('cell_code', code, { shouldValidate: true, shouldDirty: true })
    clearLocationField('village_code')
    resetLocationOptions(['villages'])
    setLocationError('')
    if (code) {
      loadLocationOptions('villages', () => locationApi.getVillages(code), 'villages')
    }
  }

  const handleVillageChange = (code) => {
    setValue('village_code', code, { shouldValidate: true, shouldDirty: true })
  }

  const retryLocations = () => {
    if (selectedCell) {
      loadLocationOptions('villages', () => locationApi.getVillages(selectedCell), 'villages')
    } else if (selectedSector) {
      loadLocationOptions('cells', () => locationApi.getCells(selectedSector), 'cells')
    } else if (selectedDistrict) {
      loadLocationOptions('sectors', () => locationApi.getSectors(selectedDistrict), 'sectors')
    } else if (selectedProvince) {
      loadLocationOptions('districts', () => locationApi.getDistricts(selectedProvince), 'districts')
    } else {
      loadProvinces()
    }
  }

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
    const isValid = await trigger(['fullName', 'phone', 'email'])
    if (isValid) {
      setDirection(1)
      setFormStep(3)
    }
  }

  const handleLocationContinue = async () => {
    setErrorMessage('')
    const isValid = await trigger([
      'province_code',
      'district_code',
      'sector_code',
      'cell_code',
      'village_code'
    ])
    if (isValid) {
      setDirection(1)
      setFormStep(4)
    }
  }

  const handleFormKeyDown = (event) => {
    if (event.key !== 'Enter' || formStep === 4) return
    event.preventDefault()
    if (formStep === 1) handleAccountTypeContinue()
    if (formStep === 2) handleDetailsContinue()
    if (formStep === 3) handleLocationContinue()
  }

  const onSubmit = async (data) => {
    if (!data.role) {
      setErrorMessage(t('auth.register.role.chooseFirst'))
      setFormStep(1)
      return
    }

    if (!passwordStrength.isStrong) {
      setErrorMessage(t('auth.register.weakPassword'))
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
        village_code: data.village_code
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
        province: response.province,
        district: response.district,
        sector: response.sector,
        cell: response.cell,
        village: response.village,
        village_code: response.village_code
      }

      login(response.token, authUser)
      const firstName = (authUser.name || authUser.phone || 'there').split(/[\s@_.]+/).filter(Boolean)[0] || 'there'
      showToast(t('auth.register.welcomeToast').replace('{name}', firstName), 'success')
      navigate(roleHome(authUser.role), { replace: true })
    } catch (error) {
      const remaining = MIN_LOADER_MS - (Date.now() - startedAt)
      if (remaining > 0) await sleep(remaining)
      setErrorMessage(error?.message || t('auth.register.errors.create'))
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
      {/* 4-Step Progress Indicator */}
      <div className="mb-7">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 z-0 h-[2px] -translate-y-1/2 bg-black/[0.08] dark:bg-white/10" />
          <div
            className={`absolute top-1/2 left-0 -translate-y-1/2 h-[2px] transition-all duration-500 z-0 bg-emerald-500 ${PROGRESS_WIDTHS[formStep - 1]}`}
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
                  {stepLabels[step.id - 1]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className="space-y-5">
        <div className="space-y-1 mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">
            {stepCopy.title}
          </h1>
          <p className="text-sm text-muted dark:text-gray-400">{stepCopy.subtitle}</p>
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
                  title={t('auth.register.role.farmerTitle')}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all active:scale-[0.99] ${
                    selectedRole === 'farmer'
                      ? 'border-brand-600 bg-brand-600 text-white shadow-[0_8px_24px_-14px_rgba(22,163,74,0.8)]'
                      : 'border-black/10 bg-black/[0.03] text-ink/75 hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-brand-400/40 dark:hover:bg-brand-500/10 dark:hover:text-brand-300'
                  }`}
                >
                  <input
                    type="radio"
                    value="farmer"
                    {...register('role', { required: t('auth.register.role.chooseRequired') })}
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
                  {t('auth.register.role.farmer')}
                </label>

                <label
                  title={t('auth.register.role.buyerTitle')}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all active:scale-[0.99] ${
                    selectedRole === 'buyer'
                      ? 'border-brand-600 bg-brand-600 text-white shadow-[0_8px_24px_-14px_rgba(22,163,74,0.8)]'
                      : 'border-black/10 bg-black/[0.03] text-ink/75 hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-brand-400/40 dark:hover:bg-brand-500/10 dark:hover:text-brand-300'
                  }`}
                >
                  <input
                    type="radio"
                    value="buyer"
                    {...register('role', { required: t('auth.register.role.chooseRequired') })}
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
                  {t('auth.register.role.buyer')}
                </label>
              </div>

              {errors.role && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.role.message}</p>
              )}
              {!selectedRole && (
                <p className="text-center text-xs text-muted dark:text-gray-500">
                  {t('auth.register.role.select')}
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
                <span>{t('auth.register.continue')}</span>
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
                    {t('auth.register.accountType')}
                  </span>
                  <p className="text-sm font-semibold text-ink dark:text-white">
                    {selectedRole === 'farmer' ? t('auth.register.role.farmer') : t('auth.register.role.buyer')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="text-xs font-semibold text-emerald-700 transition-colors hover:text-ink dark:text-emerald-300 dark:hover:text-white"
                >
                  {t('auth.register.change')}
                </button>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="register-name" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                  {t('auth.register.fields.fullName')}
                </label>
                <input
                  id="register-name"
                  {...register('fullName', { required: t('auth.register.fields.fullNameRequired') })}
                  type="text"
                  placeholder={t('auth.register.fields.fullNamePlaceholder')}
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
                    {t('auth.register.fields.phone')}
                  </label>
                  <input
                    id="register-phone"
                    {...register('phone', {
                      required: t('auth.register.fields.phoneRequired'),
                      minLength: { value: 10, message: t('auth.register.fields.phoneMin') }
                    })}
                    type="tel"
                    placeholder={t('auth.register.fields.phonePlaceholder')}
                    autoComplete="tel"
                    className={`${inputClass} ${errors.phone ? 'border-red-500/60 dark:border-red-500/50' : ''}`}
                  />
                  {errors.phone && (
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-email" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                    {t('auth.register.fields.email')}
                  </label>
                  <input
                    id="register-email"
                    {...register('email', {
                      required: t('auth.register.fields.emailRequired'),
                      pattern: { value: EMAIL_RE, message: t('auth.register.fields.emailInvalid') }
                    })}
                    type="email"
                    placeholder={t('auth.register.fields.emailPlaceholder')}
                    autoComplete="email"
                    className={`${inputClass} ${errors.email ? 'border-red-500/60 dark:border-red-500/50' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.email.message}</p>
                  )}
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
                  <span>{t('auth.register.back')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDetailsContinue}
                  className="auth-button w-2/3 py-3.5 text-white text-sm font-medium rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>{t('auth.register.continue')}</span>
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
              key="step-location"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-4"
            >
              {locationError && (
                <div className="flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">{locationError}</p>
                  <button
                    type="button"
                    onClick={retryLocations}
                    className="shrink-0 text-xs font-semibold text-red-700 underline underline-offset-2 dark:text-red-300"
                  >
                    {t('auth.register.fields.retry')}
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="register-province" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                  {t('auth.register.fields.province')}
                </label>
                <input
                  type="hidden"
                  {...register('province_code', {
                    required: t('auth.register.fields.provinceRequired')
                  })}
                />
                <CustomSelect
                  id="register-province"
                  value={selectedProvince}
                  options={locationOptions.provinces}
                  onChange={handleProvinceChange}
                  placeholder={t('auth.register.fields.provincePlaceholder')}
                  loading={loadingLocation === 'provinces'}
                  loadingText={t('auth.register.fields.loading')}
                  noOptionsText={t('auth.register.fields.noOptions')}
                  error={errors.province_code?.message}
                />
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="register-district" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                    {t('auth.register.fields.district')}
                  </label>
                  <input
                    type="hidden"
                    {...register('district_code', {
                      required: t('auth.register.fields.districtRequired')
                    })}
                  />
                  <CustomSelect
                    id="register-district"
                    value={selectedDistrict}
                    options={locationOptions.districts}
                    onChange={handleDistrictChange}
                    placeholder={t('auth.register.fields.districtPlaceholder')}
                    loading={loadingLocation === 'districts'}
                    loadingText={t('auth.register.fields.loading')}
                    noOptionsText={t('auth.register.fields.noOptions')}
                    disabled={!selectedProvince}
                    error={errors.district_code?.message}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-sector" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                    {t('auth.register.fields.sector')}
                  </label>
                  <input
                    type="hidden"
                    {...register('sector_code', {
                      required: t('auth.register.fields.sectorRequired')
                    })}
                  />
                  <CustomSelect
                    id="register-sector"
                    value={selectedSector}
                    options={locationOptions.sectors}
                    onChange={handleSectorChange}
                    placeholder={t('auth.register.fields.sectorPlaceholder')}
                    loading={loadingLocation === 'sectors'}
                    loadingText={t('auth.register.fields.loading')}
                    noOptionsText={t('auth.register.fields.noOptions')}
                    disabled={!selectedDistrict}
                    error={errors.sector_code?.message}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="register-cell" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                    {t('auth.register.fields.cell')}
                  </label>
                  <input
                    type="hidden"
                    {...register('cell_code', {
                      required: t('auth.register.fields.cellRequired')
                    })}
                  />
                  <CustomSelect
                    id="register-cell"
                    value={selectedCell}
                    options={locationOptions.cells}
                    onChange={handleCellChange}
                    placeholder={t('auth.register.fields.cellPlaceholder')}
                    loading={loadingLocation === 'cells'}
                    loadingText={t('auth.register.fields.loading')}
                    noOptionsText={t('auth.register.fields.noOptions')}
                    disabled={!selectedSector}
                    error={errors.cell_code?.message}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-village" className="text-sm font-medium text-ink/80 dark:text-gray-300">
                    {t('auth.register.fields.village')}
                  </label>
                  <input
                    type="hidden"
                    {...register('village_code', {
                      required: t('auth.register.fields.villageRequired')
                    })}
                  />
                  <CustomSelect
                    id="register-village"
                    value={watch('village_code') || ''}
                    options={locationOptions.villages}
                    onChange={handleVillageChange}
                    placeholder={t('auth.register.fields.villagePlaceholder')}
                    loading={loadingLocation === 'villages'}
                    loadingText={t('auth.register.fields.loading')}
                    noOptionsText={t('auth.register.fields.noOptions')}
                    disabled={!selectedCell}
                    error={errors.village_code?.message}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
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
                  <span>{t('auth.register.back')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLocationContinue}
                  disabled={Boolean(loadingLocation)}
                  className={`auth-button w-2/3 py-3.5 text-white text-sm font-medium rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 ${
                    loadingLocation ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                >
                  <span>{t('auth.register.continue')}</span>
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

          {formStep === 4 && (
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
                    {t('auth.register.fields.password')}
                  </label>
                  <span className="text-xs font-medium text-muted dark:text-gray-400">{t('auth.register.fields.minChars')}</span>
                </div>
                <div className="relative">
                  <input
                    id="register-password"
                    {...register('password', {
                      required: t('auth.register.fields.passwordRequired'),
                      validate: (val) =>
                        getPasswordStrength(val).isStrong ||
                        t('auth.register.fields.passwordValidate')
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.fields.passwordPlaceholder')}
                    autoComplete="new-password"
                    className={`${inputClass} pr-11 ${errors.password ? 'border-red-500/60 dark:border-red-500/50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={showPassword ? t('auth.common.hidePassword') : t('auth.common.showPassword')}
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
                        {passwordStrength.hasMinLength ? '✓' : '•'} {t('auth.register.passwordStrength.length')}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          passwordStrength.hasUpper ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-muted dark:text-gray-400'
                        }`}
                      >
                        {passwordStrength.hasUpper ? '✓' : '•'} {t('auth.register.passwordStrength.upper')}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          passwordStrength.hasLower ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-muted dark:text-gray-400'
                        }`}
                      >
                        {passwordStrength.hasLower ? '✓' : '•'} {t('auth.register.passwordStrength.lower')}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          passwordStrength.hasNumberOrSymbol ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-muted dark:text-gray-400'
                        }`}
                      >
                        {passwordStrength.hasNumberOrSymbol ? '✓' : '•'} {t('auth.register.passwordStrength.number')}
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
                  {t('auth.register.fields.confirm')}
                </label>
                <div className="relative">
                  <input
                    id="register-confirm"
                    {...register('confirmPassword', {
                      required: t('auth.register.fields.confirmRequired'),
                      validate: (value) => value === password || t('auth.register.fields.mismatch')
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.fields.confirmPlaceholder')}
                    autoComplete="new-password"
                    className={`${inputClass} pr-11 ${errors.confirmPassword ? 'border-red-500/60 dark:border-red-500/50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={showConfirmPassword ? t('auth.common.hidePassword') : t('auth.common.showPassword')}
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
                      required: t('auth.register.fields.termsRequired')
                    })}
                    className="mt-1 h-4 w-4 cursor-pointer rounded border-black/15 bg-black/[0.03] text-[#16a34a] accent-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30 dark:border-white/20 dark:bg-white/5"
                  />
                  <span className="text-xs leading-snug text-muted dark:text-gray-400">
                    {t('auth.register.termsPrefix')}{' '}
                    <span className="font-semibold text-ink underline underline-offset-2 dark:text-white">
                      {t('auth.register.termsOfService')}
                    </span>{' '}
                    {t('auth.register.termsAnd')}{' '}
                    <span className="font-semibold text-ink underline underline-offset-2 dark:text-white">
                      {t('auth.register.privacy')}
                    </span>
                    {t('auth.register.termsSuffix')}
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
                  onClick={() => goToStep(3)}
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
                  <span>{t('auth.register.back')}</span>
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
                      {isSubmitting ? t('auth.register.creatingAccount') : t('auth.register.createAccount')}
                    </span>
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="pt-2 text-center text-sm text-muted dark:text-gray-400">
          {t('auth.register.haveAccount')}{' '}
          <Link to={ROUTE_PATHS.LOGIN} className="font-semibold text-ink hover:underline dark:text-white">
            {t('auth.register.signIn')}
          </Link>
        </p>
      </form>
    </div>
  )
}
