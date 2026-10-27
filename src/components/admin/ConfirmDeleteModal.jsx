/**
 * ConfirmDeleteModal — portaled confirmation for destructive admin actions
 * (delete user, delete role). Mirrors the Soma ConfirmDeleteModal.
 */
import React from 'react'
import { createPortal } from 'react-dom'

const ConfirmDeleteModal = ({ open, title = 'Delete', message = '', itemName, onClose, onConfirm, isLoading = false, confirmLabel = 'Delete' }) => {
  if (!open) return null

  const handleConfirm = () => {
    if (!isLoading) onConfirm()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      onClick={isLoading ? undefined : onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[440px] rounded-2xl border border-line bg-[#efe7d6] shadow-2xl p-6 sm:p-7 animate-[zoomIn_0.2s_ease]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-ink tracking-tight">{title}</h3>
        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
          {message}
          {itemName && (
            <>
              {' '}
              <span className="font-semibold text-ink">"{itemName}"</span>
              .
            </>
          )}
        </p>
        <div className="pt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium bg-[#fbf7ec] text-ink border border-line hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium bg-danger-600 text-white hover:bg-danger-700 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading && <span className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {isLoading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmDeleteModal