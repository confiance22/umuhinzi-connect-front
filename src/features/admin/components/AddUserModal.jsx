/**
 * AddUserModal — create or update an Umuhinzi Connect account.
 */
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const inputClass =
  'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all'
const labelClass = 'block text-sm font-medium text-ink mb-1.5'

const roleKeyOf = (user, roleList) => {
  if (!user) return ''
  if (typeof user.role === 'string' && user.role) return user.role
  if (user.role && typeof user.role === 'object' && user.role.key) return user.role.key
  const first = Array.isArray(user.roles) ? user.roles[0] : null
  if (typeof first === 'string') return first
  if (first?.key) return first.key
  const roleId = user.roleId ?? user.role_id
  if (roleId != null) {
    const match = roleList.find((role) => String(role.id) === String(roleId))
    if (match) return match.key
  }
  return ''
}

export const AddUserModal = ({ isOpen, onClose, onSubmit, editingUser, roles = [] }) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('Active')
  const [role, setRole] = useState('farmer')

  const isEditMode = !!editingUser

  useEffect(() => {
    if (!isOpen) return
    if (editingUser) {
      setName(editingUser.name || '')
      setPhone(editingUser.phone || editingUser.username || '')
      setEmail(editingUser.email || '')
      setStatus(editingUser.enabled === false ? 'Inactive' : 'Active')
      setRole(roleKeyOf(editingUser, roles) || 'farmer')
    } else {
      setName('')
      setPhone('')
      setEmail('')
      setStatus('Active')
      setRole('farmer')
    }
  }, [editingUser, isOpen, roles])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[600px] max-h-[92vh] overflow-y-auto bg-card rounded-2xl border border-line shadow-soft p-6 sm:p-8 animate-[zoomIn_0.2s_ease]"
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
          <span className="w-11 h-11 rounded-2xl bg-brand-600/15 text-ink flex items-center justify-center mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" />
            </svg>
          </span>
          <h3 className="text-sm font-semibold text-ink">
            {isEditMode ? 'Update user' : 'Add new user'}
          </h3>
          <p className="text-xs text-muted mt-1">
            {isEditMode
              ? 'Modify this account, its role and access status.'
              : 'Create a farmer, buyer or super admin account.'}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit({ name, phone, email, status, role })
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aline Mukamana"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250 788 000 000"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.rw"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                {roles.length === 0 && <option value="farmer">Farmer</option>}
                {roles.map((item) => (
                  <option key={item.id || item.key} value={item.key}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            {isEditMode && (
              <div>
                <label className={labelClass}>Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>

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
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
            >
              {isEditMode ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default AddUserModal
