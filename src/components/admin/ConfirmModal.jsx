/**
 * ConfirmModal — in-app confirmation dialog (replaces native window.confirm).
 * Centered, max-w-md, rounded-2xl with a soft-blurred backdrop. Supports
 * loading state on the primary action, Esc / backdrop close, and optional
 * extra content between the message and the action row.
 */
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

const TONE_CLASSES = {
  green: 'bg-[#d9f99d] text-[#0f3d25] hover:bg-[#c3f27f]',
  red: 'bg-rose-600 text-white hover:bg-rose-700',
  amber: 'bg-amber-500 text-white hover:bg-amber-600',
}

const ConfirmModal = ({
  open,
  title,
  message,
  icon,
  iconChip = 'bg-emerald-50 text-emerald-600',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'green',
  onCancel,
  onConfirm,
  loading = false,
  children,
}) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading && onCancel) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, loading, onCancel])

  if (!open) return null

  const handleConfirm = () => {
    if (!loading) onConfirm()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      onClick={loading ? undefined : onCancel}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#fbf7ec] p-6 shadow-2xl animate-[zoomIn_0.2s_ease]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3">
          {icon ? (
            <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconChip}`}>{icon}</span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => !loading && onCancel && onCancel()}
            className="w-8 h-8 rounded-full hover:bg-[#e8dfca] text-gray-400 hover:text-ink flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-ink mt-4">{title}</h3>
        {message && <p className="text-sm text-muted mt-1.5 leading-relaxed">{message}</p>}
        {children}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#fbf7ec] text-ink border border-gray-200 text-sm font-medium hover:bg-[#e8dfca] transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none ${TONE_CLASSES[tone] || TONE_CLASSES.green}`}
          >
            {loading && <span className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmModal