/**
 * AddRoleModal — create/update a role (name + description).
 * Ported from Soma Connect's AddRoleModal, brand-teal accents.
 */
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const inputClass =
  'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all'
const labelClass = 'block text-sm font-medium text-ink mb-1.5'

export const AddRoleModal = ({ isOpen, onClose, onSubmit, editingRole }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const isEditMode = !!editingRole

  useEffect(() => {
    if (!isOpen) return
    if (editingRole) {
      setName(editingRole.name || '')
      setDescription(editingRole.description || '')
    } else {
      setName('')
      setDescription('')
    }
  }, [editingRole, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), description: description.trim() })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[520px] max-h-[92vh] overflow-y-auto bg-card rounded-2xl border border-line shadow-soft p-6 sm:p-8 animate-[zoomIn_0.2s_ease]"
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v6M9 11h6" />
            </svg>
          </span>
          <h3 className="text-sm font-semibold text-ink">
            {isEditMode ? 'Update role' : 'Add new role'}
          </h3>
          <p className="text-xs text-muted mt-1">
            {isEditMode ? 'Rename this role or refine what it is for.' : 'Create a role, then attach permissions from the table.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Role Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Stock Controller" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What can people with this role do?" className={`${inputClass} resize-none`} />
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
              {isEditMode ? 'Save changes' : 'Create role'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default AddRoleModal