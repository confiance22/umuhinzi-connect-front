/**
 * AddWorkerModal — add or edit a shop worker (Shop Manager only).
 * Captures full name, national ID (for police traceability of anyone handling
 * stock), username, email, phone, status and the worker's 4-digit login PIN.
 * The manager sets the PIN at creation and hands it to the worker to memorise;
 * the worker types it in on every login. Matches the admin portal modal style.
 */
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const inputClass =
  'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all'
const labelClass = 'block text-sm font-medium text-ink mb-1.5'

const NID_RE = /^\d{16}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PIN_RE = /^\d{4}$/
const randomPin = () => String(Math.floor(1000 + Math.random() * 9000))

export const AddWorkerModal = ({ isOpen, onClose, onSubmit, editingWorker }) => {
  const [name, setName] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('worker')
  const [status, setStatus] = useState('Active')

  const [errors, setErrors] = useState({})
  const isEditMode = !!editingWorker
  const effectiveRole = isEditMode ? (editingWorker?.role === 'shop_manager' ? 'shop_manager' : 'worker') : role

  useEffect(() => {
    if (!isOpen) return
    setErrors({})
    if (editingWorker) {
      setName(editingWorker.name || '')
      setNationalId(editingWorker.nationalId || '')
      setUsername(editingWorker.username || '')
      setEmail(editingWorker.email || '')
      setPhone(editingWorker.phone || '')
      setPin('')
      setPassword('')
      setRole(editingWorker.role === 'shop_manager' ? 'shop_manager' : 'worker')
      setStatus(editingWorker.enabled === false ? 'Inactive' : 'Active')
    } else {
      setName('')
      setNationalId('')
      setUsername('')
      setEmail('')
      setPhone('')
      setPin(randomPin())
      setPassword('')
      setRole('worker')
      setStatus('Active')
    }
  }, [editingWorker, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const validate = () => {
    const next = {}
    if (!name.trim()) next.name = 'Full name is required'
    const nid = nationalId.trim()
    if (effectiveRole !== 'shop_manager' && !nid) next.nationalId = 'National ID is required'
    else if (nid && !NID_RE.test(nid)) next.nationalId = 'National ID must be 16 digits'
    if (!username.trim()) next.username = 'Username is required'
    if (!email.trim()) next.email = 'Email is required'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address'
    const p = pin.trim()
    if (effectiveRole === 'shop_manager') {
      const pw = password.trim()
      if (isEditMode) {
        if (pw && pw.length < 8) next.password = 'Password must be at least 8 characters'
      } else if (!pw || pw.length < 8) {
        next.password = 'Save this password down — the manager logs in with it.'
      }
    } else if (isEditMode) {
      if (p && !PIN_RE.test(p)) next.pin = 'PIN must be exactly 4 digits'
    } else if (!PIN_RE.test(p)) {
      next.pin = 'Save this PIN down — the worker logs in with it.'
    }
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return
    onSubmit({
      name: name.trim(),
      nationalId: nationalId.trim(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      pin: pin.trim(),
      password: password.trim(),
      role: effectiveRole,
      status,
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[560px] max-h-[92vh] overflow-y-auto bg-card rounded-2xl border border-line shadow-soft p-6 sm:p-8 animate-[zoomIn_0.2s_ease]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mb-6 pr-8">
          <span className="w-11 h-11 rounded-2xl bg-brand-600/15 text-brand-700 flex items-center justify-center mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 10h-6M19 7v6" />
            </svg>
          </span>
          <h3 className="text-sm font-semibold text-ink">
            {isEditMode ? 'Edit team member' : 'Add new team member'}
          </h3>
          <p className="text-xs text-muted mt-1">
            {isEditMode
              ? 'Update this staff member’s details.'
              : 'Their identity is recorded on every stock movement for the audit trail.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditMode && (
            <div>
              <label className={labelClass}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="worker">Worker — handles stock, logs in with PIN</option>
                <option value="shop_manager">Shop Manager — co-manages the shop, logs in with password + code</option>
              </select>
            </div>
          )}
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ganza Kenny"
              className={inputClass}
            />
            {errors.name && <p className="text-xs font-semibold text-danger-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className={labelClass}>National ID (for traceability)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={16}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
              placeholder="16-digit NID (e.g. 1198503077884312)"
              className={inputClass}
            />
            {errors.nationalId ? (
              <p className="text-xs font-semibold text-danger-600 mt-1">{errors.nationalId}</p>
            ) : (
              <p className="text-xs text-muted mt-1">
                {effectiveRole === 'shop_manager'
                  ? 'Optional for managers. If provided, it must be 16 digits.'
                  : 'Enables police/audit tracking of anyone handling stock.'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. gkenny"
                className={inputClass}
              />
              {errors.username && <p className="text-xs font-semibold text-danger-600 mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250 7XX XXX XXX"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. g.kenny@shop.rw"
              className={inputClass}
            />
            {errors.email && <p className="text-xs font-semibold text-danger-600 mt-1">{errors.email}</p>}
          </div>

          {effectiveRole === 'shop_manager' && !isEditMode && (
            <div>
              <label className={labelClass}>Login Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set their login password (min 8 characters)"
                className={`${inputClass} tracking-[0.1em] font-bold`}
              />
              {errors.password ? (
                <p className="text-xs font-semibold text-danger-600 mt-1">{errors.password}</p>
              ) : (
                <p className="text-xs text-muted mt-1">
                  Set any password you want. The manager logs in with it and a code sent to their email.
                </p>
              )}
            </div>
          )}

          {effectiveRole !== 'shop_manager' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`${labelClass} mb-0`}>Login PIN</label>
                <button
                  type="button"
                  onClick={() => setPin(randomPin())}
                  className="text-xs font-bold text-brand-700 hover:text-brand-800 uppercase tracking-wide transition-colors"
                >
                  {isEditMode ? 'Generate new PIN' : 'Generate'}
                </button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4 digits (worker memorises it)"
                className={`${inputClass} tracking-[0.4em] font-bold text-center`}
              />
              {errors.pin ? (
                <p className="text-xs font-semibold text-danger-600 mt-1">{errors.pin}</p>
              ) : (
                <p className="text-xs text-muted mt-1">
                  {isEditMode
                    ? 'Only set a new PIN if the old one was forgotten — leave blank to keep the current PIN.'
                    : 'Share it once. The worker types this PIN on every login.'}
                </p>
              )}
            </div>
          )}

          {isEditMode && (
            <div>
              <label className={labelClass}>Worker Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} cursor-pointer`}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-white text-ink border border-line hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {isEditMode ? 'Save changes' : 'Add team member'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default AddWorkerModal