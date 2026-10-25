/**
 * AddUserModal — create/update a platform user (name, username, email,
 * status, one or more roles) plus a searchable RoleMultiSelect picker.
 * Ported from Soma Connect's AddUserModal, adapted to StockRwa (no entities).
 */
import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const inputClass =
  'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all'
const labelClass = 'block text-sm font-medium text-ink mb-1.5'

const RoleMultiSelect = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  const dropdownRef = useRef(null)
  const [dropdownStyle, setDropdownStyle] = useState(null)

  useEffect(() => {
    const onDoc = (e) => {
      const clickedControl = ref.current?.contains(e.target)
      const clickedDropdown = dropdownRef.current?.contains(e.target)
      if (!clickedControl && !clickedDropdown) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const updatePosition = () => {
      const control = ref.current
      if (!control) return
      const rect = control.getBoundingClientRect()
      const margin = 12
      const belowSpace = window.innerHeight - rect.bottom - margin
      const aboveSpace = rect.top - margin
      const openUpward = belowSpace < 260 && aboveSpace > belowSpace
      const maxHeight = Math.max(160, Math.min(320, openUpward ? aboveSpace - 8 : belowSpace - 8))
      setDropdownStyle({
        width: rect.width,
        left: rect.left,
        top: rect.bottom + 8,
        transform: openUpward ? `translateY(-${rect.height + 16}px)` : 'none',
        maxHeight,
      })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  const selected = options.filter((o) => value.includes(String(o.id)))
  const filtered = options.filter((o) => (o.name || '').toLowerCase().includes(query.toLowerCase()))
  const toggle = (id) => {
    const s = String(id)
    onChange(value.includes(s) ? value.filter((v) => v !== s) : [...value, s])
  }

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setOpen((o) => !o)}
        className={`min-h-[44px] w-full rounded-lg bg-white border px-2.5 py-2 flex flex-wrap items-center gap-1.5 cursor-pointer transition-all ${
          open ? 'border-brand-500 outline outline-2 outline-brand-500/25' : 'border-line'
        }`}
      >
        {selected.length === 0 && <span className="text-sm text-muted/55 px-1">Select one or more roles…</span>}
        {selected.map((o) => (
          <span key={o.id} className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold pl-2.5 pr-1 py-1">
            {o.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggle(o.id)
              }}
              className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-brand-700/10 text-brand-700/70 hover:text-brand-700"
              aria-label={`Remove ${o.name}`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}
        <svg className={`w-4 h-4 text-muted ml-auto shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {open &&
        dropdownStyle &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ position: 'fixed', left: dropdownStyle.left, top: dropdownStyle.top, width: dropdownStyle.width, transform: dropdownStyle.transform, zIndex: 70 }}
            className="rounded-2xl bg-card border border-line shadow-soft overflow-hidden animate-[fadeIn_0.15s_ease]"
          >
            <div className="p-2 border-b border-line">
              <div className="relative">
                <svg className="w-4 h-4 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
                </svg>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search roles…"
                  className="w-full rounded-lg border border-line bg-white pl-8 pr-3 py-2 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25"
                />
              </div>
            </div>
            <div className="overflow-y-auto py-1" style={{ maxHeight: dropdownStyle.maxHeight }}>
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-muted">No roles found</p>
              ) : (
                filtered.map((o) => {
                  const isSel = value.includes(String(o.id))
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggle(o.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-brand-700/10 transition-colors text-left"
                    >
                      <span className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 border ${isSel ? 'bg-brand-700 border-brand-700' : 'border-line'}`}>
                        {isSel && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="font-medium">{o.name}</span>
                    </button>
                  )
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

const resolveRoleIds = (user, roleList) => {
  if (!user) return []
  const out = new Set()
  const addByName = (n) => {
    const m = roleList.find((r) => r.name === n || r.key === n)
    if (m) out.add(String(m.id))
  }
  if (Array.isArray(user.roles)) {
    user.roles.forEach((r) => {
      if (r && typeof r === 'object' && r.id != null) out.add(String(r.id))
      else if (typeof r === 'string') addByName(r)
      else if (r != null) out.add(String(r))
    })
  }
  if (user.roleId != null) out.add(String(user.roleId))
  if (user.role && typeof user.role === 'object' && user.role.id != null) out.add(String(user.role.id))
  if (user.roleName) addByName(user.roleName)
  return [...out]
}

export const AddUserModal = ({ isOpen, onClose, onSubmit, editingUser, roles = [] }) => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('Active')
  const [roleIds, setRoleIds] = useState([])

  const isEditMode = !!editingUser

  useEffect(() => {
    if (!isOpen) return
    if (editingUser) {
      setName(editingUser.name || '')
      setUsername(editingUser.username || '')
      setEmail(editingUser.email || '')
      setStatus(editingUser.status || 'Active')
      setRoleIds(resolveRoleIds(editingUser, roles))
    } else {
      setName('')
      setUsername('')
      setEmail('')
      setStatus('Active')
      setRoleIds([])
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
          <span className="w-11 h-11 rounded-2xl bg-brand-700/15 text-ink flex items-center justify-center mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" />
            </svg>
          </span>
          <h3 className="text-sm font-semibold text-ink">
            {isEditMode ? 'Update user' : 'Add new user'}
          </h3>
          <p className="text-xs text-muted mt-1">
            {isEditMode ? 'Modify this account, its status, and assigned roles.' : 'Create an account and assign one or more roles.'}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit({ name, username, email, status, roleIds })
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ganza Kenny" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. gkenny" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. g.kenny@shop.rw" className={inputClass} />
          </div>

          {isEditMode && (
            <div>
              <label className={labelClass}>Account Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} cursor-pointer`}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>Roles</label>
            <RoleMultiSelect options={roles} value={roleIds} onChange={setRoleIds} />
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
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-brand-700 text-white hover:bg-brand-800 transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
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