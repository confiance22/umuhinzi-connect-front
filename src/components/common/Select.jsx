/**
 * Select — shared dropdown with label + error state.
 */
export default function Select({ label, error, id, options = [], className = '', ...rest }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`h-11 w-full rounded-lg border bg-white px-4 text-sm text-ink focus:outline focus:outline-2 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:outline-red-500/25'
            : 'border-line focus:border-brand-500 focus:outline-brand-500/25'
        } ${className}`}
        {...rest}
      >
        <option value="">— Select —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  )
}