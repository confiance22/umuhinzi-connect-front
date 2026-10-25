/**
 * ExportActions — Excel / PDF / CSV buttons shared by every report page.
 * Uses the site's standard pill buttons (brand-green filled primary,
 * white outlined secondary) so exports render consistently everywhere.
 */
import React from 'react'

export default function ExportActions({ onExcel, onPDF, onCSV }) {
  return (
    <div className="flex items-stretch gap-2 flex-wrap">
      <button
        onClick={onExcel}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink transition-[transform,background-color,color] duration-150 hover:bg-page active:scale-[0.98]"
        title="Branded Excel worksheet with logo & shop name"
      >
        <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        Excel
      </button>
      <button
        onClick={onPDF}
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-700 px-3.5 py-2 text-xs font-semibold text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98]"
        title="Branded PDF report with logo & shop name"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="12" y2="12" />
          <line x1="15" y1="15" x2="12" y2="12" />
        </svg>
        PDF Report
      </button>
      <button
        onClick={onCSV}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink transition-[transform,background-color,color] duration-150 hover:bg-page active:scale-[0.98]"
        title="Comma-separated values export"
      >
        <svg className="w-3.5 h-3.5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
        </svg>
        CSV
      </button>
    </div>
  )
}