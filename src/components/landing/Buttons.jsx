import React from 'react'

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium bg-[#16a34a] text-white shadow-[0_10px_30px_-12px_rgba(34,197,94,0.55)] hover:bg-[#15803d] active:scale-95 transition-all ${className}`}
    {...props}
  >
    {children}
  </button>
)

export const GhostButton = ({ children, className = '', ...props }) => (
  <button
    className={`inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-brand-500/40 hover:bg-brand-50 hover:text-brand-700 active:scale-95 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200 dark:hover:bg-brand-500/10 dark:hover:text-brand-200 ${className}`}
    {...props}
  >
    {children}
  </button>
)
