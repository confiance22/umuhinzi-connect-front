/**
 * UsernameField — username input with a LIVE availability indicator.
 * As the user types, it debounces and asks the backend
 * (GET /auth/username-available?username=...) whether the username is free.
 * Green check = available, red = already taken. Pass excludeId (the current
 * user's id) so a user editing their own username keeps it available.
 */
import React, { useState, useEffect } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { authApi } from '../../api/authApi'

export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/

export const usernameValid = (value) => {
  const v = String(value || '').trim()
  return v.length >= 3 && v.length <= 30 && USERNAME_PATTERN.test(v)
}

const STATUS = {
  IDLE: 'idle',
  CHECKING: 'checking',
  AVAILABLE: 'available',
  TAKEN: 'taken',
  CURRENT: 'current',
  INVALID: 'invalid',
}

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
  </svg>
)

const Check = () => (
  <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const Cross = () => (
  <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export const UsernameField = ({
  value,
  onChange,
  currentUsername = '',
  excludeId = null,
  label = 'Username',
  hint,
  placeholder = 'Choose a unique username',
  disabled = false,
  onStatusChange,
  inputClass = 'h-11 w-full rounded-lg border border-line bg-white px-3.5 pr-10 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all',
}) => {
  const [status, setStatus] = useState(STATUS.IDLE)
  const debounced = useDebounce(value, 300)
  const trimmed = String(debounced || '').trim()

  useEffect(() => {
    let cancelled = false
    if (!trimmed) {
      setStatus(STATUS.IDLE)
      return
    }
    if (!usernameValid(trimmed)) {
      setStatus(STATUS.INVALID)
      return
    }
    if (currentUsername && trimmed.toLowerCase() === String(currentUsername).toLowerCase()) {
      setStatus(STATUS.CURRENT)
      return
    }
    setStatus(STATUS.CHECKING)
    authApi
      .checkUsernameAvailable(trimmed, excludeId)
      .then((available) => {
        if (cancelled) return
        setStatus(available ? STATUS.AVAILABLE : STATUS.TAKEN)
      })
      .catch(() => {
        if (cancelled) return
        setStatus(STATUS.AVAILABLE)
      })
    return () => {
      cancelled = true
    }
  }, [trimmed, currentUsername, excludeId])

  useEffect(() => {
    if (onStatusChange) onStatusChange(status)
  }, [status, onStatusChange])

  const messages = {
    [STATUS.IDLE]: null,
    [STATUS.CHECKING]: { text: 'Checking availability…', tone: 'text-gray-400', icon: <Spinner /> },
    [STATUS.AVAILABLE]: { text: `${trimmed} is available`, tone: 'text-emerald-600', icon: <Check /> },
    [STATUS.TAKEN]: { text: `${trimmed} is already taken`, tone: 'text-rose-600', icon: <Cross /> },
    [STATUS.CURRENT]: { text: 'This is your current username', tone: 'text-emerald-600', icon: <Check /> },
    [STATUS.INVALID]: { text: 'Use 3–30 letters, numbers, dots, dashes or underscores', tone: 'text-amber-600', icon: null },
  }

  const message = messages[status]

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          className={`${inputClass} ${status === STATUS.TAKEN ? 'border-rose-400 focus:border-rose-500 focus:outline-rose-500/20' : ''}`}
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">{message?.icon || null}</span>
      </div>
      {message && (
        <p className={`text-xs mt-1 font-medium ${message.tone} flex items-center gap-1.5 ${message.icon ? '' : 'leading-relaxed'}`}>
          {message.icon}
          {message.text}
        </p>
      )}
      {hint && !message && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  )
}

export default UsernameField