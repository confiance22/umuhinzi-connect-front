/**
 * OtpInput — reusable 6-digit OTP code input with paste support, auto-advance,
 * error/success styling and a resend countdown. Used by the login 2FA step,
 * register email verification and the forgot-password flow.
 *
 * Props:
 *   onComplete(code)           — fires when all digits are filled
 *   onResend()                 — fires when the user clicks resend
 *   status ('idle'|'error'|'success') — styling signal from the parent
 *   disabled                   — lock input while a request is in flight
 */
import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'

const STATUS_CLASSES = {
  error:
    'animate-shake border-red-400 bg-red-500/10 text-red-600 shadow-[0_0_10px_rgba(239,68,68,0.15)] dark:text-red-300',
  success:
    'scale-105 border-emerald-500 bg-emerald-500/10 text-emerald-700 shadow-[0_0_14px_rgba(16,185,129,0.35)] dark:text-emerald-300',
  idle:
    'border-black/10 bg-black/[0.03] hover:border-brand-600 hover:bg-brand-500/10 focus:border-brand-600 focus:bg-white focus:ring-4 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-brand-700 dark:hover:bg-brand-700/10 dark:focus:border-white dark:focus:bg-white/10 dark:focus:ring-brand-700/40',
}

const BASE_CLASS =
  'h-14 w-11 rounded-xl border text-center text-xl font-bold text-ink caret-brand-600 outline-none transition-all duration-200 dark:text-white dark:caret-white sm:w-12'

export default function OtpInput({ onComplete, onResend, status = 'idle', disabled = false, length = 6 }) {
  const { t } = useLanguage()
  const [values, setValues] = useState(Array(length).fill(''))
  const [timeLeft, setTimeLeft] = useState(60)
  const refs = useRef([])

  // Resend countdown.
  useEffect(() => {
    if (timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [timeLeft])

  // Focus the first box on mount.
  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  // On error: clear and refocus so the user can retry cleanly.
  useEffect(() => {
    if (status !== 'error') return
    const id = setTimeout(() => {
      setValues(Array(length).fill(''))
      refs.current[0]?.focus()
    }, 500)
    return () => clearTimeout(id)
  }, [status, length])

  const verifyIfComplete = (next) => {
    const code = next.join('')
    if (code.length === length && !disabled) onComplete?.(code)
  }

  const handleChange = (index, e) => {
    const { value } = e.target
    const next = [...values]

    if (value.length > 1) {
      // Paste: distribute digits across the remaining boxes.
      const digits = value.replace(/\D/g, '').slice(0, length).split('')
      digits.forEach((d, i) => {
        if (index + i < length) next[index + i] = d
      })
      setValues(next)
      refs.current[Math.min(index + digits.length, length - 1)]?.focus()
    } else {
      if (value !== '' && !/^\d$/.test(value)) return
      next[index] = value
      setValues(next)
      if (value !== '' && index < length - 1) refs.current[index + 1]?.focus()
    }

    verifyIfComplete(next)
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      refs.current[index - 1]?.focus()
    } else if (e.key === 'Enter') {
      verifyIfComplete(values.filter(Boolean))
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').split('').slice(0, length)
    if (!digits.length) return
    const next = [...values]
    digits.forEach((d, i) => {
      next[i] = d
    })
    setValues(next)
    const focusIndex = Math.min(digits.length, length - 1)
    refs.current[focusIndex]?.focus()
    if (digits.length === length) verifyIfComplete(next)
  }

  const handleResend = () => {
    setTimeLeft(60)
    setValues(Array(length).fill(''))
    onResend?.()
  }

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60)
    const s = timeLeft % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      <div className="space-y-2.5">
        <label className="text-sm font-medium text-ink dark:text-white">{t('auth.otp.label')}</label>
        <div className="flex gap-2 sm:gap-2.5 justify-between">
          {values.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                refs.current[index] = el
              }}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={length}
              value={digit}
              disabled={disabled || status === 'success'}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`${BASE_CLASS} ${STATUS_CLASSES[status] ?? STATUS_CLASSES.idle}`}
              aria-label={t('auth.otp.digit').replace('{index}', index + 1).replace('{length}', length)}
            />
          ))}
        </div>

        <div className="space-y-4 border-t border-black/10 pt-5 text-center dark:border-white/10">
          <div className="space-y-1.5">
            <p className="text-sm text-muted dark:text-gray-400">{t('auth.otp.noCode')}</p>
            {timeLeft > 0 ? (
              <p className="text-sm font-semibold text-muted dark:text-gray-400">
                {t('auth.otp.resendIn').replace('{time}', formatTime())}
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={disabled}
                className="text-sm font-bold text-ink hover:underline disabled:opacity-60 dark:text-white"
              >
                {t('auth.otp.resend')}
              </button>
            )}
          </div>
          <p className="text-xs text-muted dark:text-gray-400">
            {t('auth.otp.expire')}
          </p>
        </div>
      </div>
    </>
  )
}