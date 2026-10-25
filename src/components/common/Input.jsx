/**
 * Input — shared form input with label + error state.
 * Linked to utils/validators.js validation conventions ({ valid, error }).
 */
export default function Input({
  label,
  error,
  hint,
  type = 'text',
  id,
  className = '',
  ...rest
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`h-11 w-full rounded-lg border bg-white px-4 text-sm text-ink placeholder:text-muted/55 focus:outline focus:outline-2 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:outline-red-500/25'
            : 'border-line focus:border-brand-500 focus:outline-brand-500/25'
        } ${className}`}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error ? (
        <p className="mt-1 text-xs text-danger-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  )
}