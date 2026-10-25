/**
 * ExportMenu — a compact dropdown of export options (Excel / PDF / CSV).
 * Used wherever a professional branded export (logo + shop name) is offered.
 */
import React, { useEffect, useRef, useState } from 'react'

const OPTIONS = [
  {
    key: 'excel',
    label: 'Excel Worksheet',
    hint: 'Branded .xlsx with logo & shop name',
    icon: (
      <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
    ),
  },
  {
    key: 'pdf',
    label: 'PDF Report',
    hint: 'Printable branded document',
    icon: (
      <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="12" y2="12" />
        <line x1="15" y1="15" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    key: 'csv',
    label: 'CSV (raw data)',
    hint: 'Plain spreadsheet for analysis',
    icon: (
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
]

export default function ExportMenu({ excelLabel, onExcel, onPdf, onCsv, disabled, allowCsv = true }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const run = (key) => {
    setOpen(false)
    if (key === 'excel' && onExcel) onExcel()
    else if (key === 'pdf' && onPdf) onPdf()
    else if (key === 'csv' && onCsv) onCsv()
  }

  const visibleOptions = OPTIONS.filter((o) => allowCsv || o.key !== 'csv')

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-ink border border-line hover:bg-page text-sm font-medium px-4 py-2 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
        title="Export report (branded Excel, PDF, or raw CSV)"
      >
        <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        {excelLabel || 'Export'}
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-line bg-card shadow-soft z-50 py-1.5 overflow-hidden">
          {visibleOptions.map((o) => (
            <button
              key={o.key}
              onClick={() => run(o.key)}
              className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-page transition-colors text-left"
            >
              <span className="mt-0.5 shrink-0">{o.icon}</span>
              <span>
                <span className="block text-xs font-semibold text-ink">{o.label}</span>
                <span className="block text-xs text-gray-400 mt-0.5">{o.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}