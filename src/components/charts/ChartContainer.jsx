/**
 * ChartContainer — wrapper giving all charts consistent header, loading / empty /
 * error states, and responsive styling matching the Super Admin Portal design.
 */
import Loader from '../common/Loader'

export default function ChartContainer({
  title,
  subtitle,
  badge,
  action,
  loading = false,
  empty = false,
  emptyText = 'No chart data available',
  error = null,
  children,
  className = '',
  height = 'h-56',
}) {
  return (
    <div className={`rounded-2xl border border-line bg-card shadow-soft p-6 transition-all ${className}`}>
      {(title || action || badge) && (
        <div className="mb-5 flex items-start justify-between gap-2 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2">
              {title && <h3 className="text-base font-semibold text-ink leading-snug">{title}</h3>}
              {badge && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="mt-1 text-[13px] text-muted leading-snug">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {loading ? (
        <div className={`flex items-center justify-center ${height}`}>
          <Loader />
        </div>
      ) : error ? (
        <div className={`flex items-center justify-center text-sm text-rose-500 ${height}`}>
          {error}
        </div>
      ) : empty ? (
        <div className={`flex flex-col items-center justify-center text-center ${height}`}>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-300">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <p className="text-sm font-medium text-muted">{emptyText}</p>
        </div>
      ) : (
        <div className={height}>{children}</div>
      )}
    </div>
  )
}