/**
 * Button — base UI button.
 * Props: variant (primary | secondary | danger | ghost), size, loading,
 * disabled. When loading, disables clicks and shows a spinner (Loader).
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-brand-700 text-white hover:bg-brand-800',
    secondary: 'bg-white text-ink border border-line hover:bg-page',
    danger: 'bg-danger-600 text-white hover:bg-danger-700',
    ghost: 'text-brand-700 hover:bg-brand-50',
  }
  const sizes = { sm: 'px-4 py-2', md: 'px-6 py-3', lg: 'px-8 py-3.5' }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
}