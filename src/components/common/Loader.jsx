/**
 * Loader — shared loading indicator (spinner + optional label), also used
 * inside Buttons while async work is pending.
 */
export default function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-sm text-gray-500 ${className}`}>
      <span className="size-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      {label}
    </div>
  )
}