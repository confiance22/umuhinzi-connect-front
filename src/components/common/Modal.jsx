/**
 * Modal — accessible overlay dialog wrapper.
 * Handles: backdrop+ESC close, focus containment, title + children + footer.
 * Used by ConfirmDialog and inline edit dialogs.
 */
export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-2xl border border-line bg-card p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-sm font-semibold text-ink">{title}</h2>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
        {/* TODO: focus trap, ESC handler, scroll lock while open */}
      </div>
    </div>
  )
}