/**
 * ReportTable — branded data table shared by all four report pages.
 * Header row carries the site's primary brand colour (the same dark green
 * used on the active navigation bar); body rows are white with a subtle
 * alternating light-gray stripe; currency/numeric columns right-align; the
 * TOTAL row is bold and separated by a double top border.
 */
import React from 'react'
import { STATUS_PILL } from './helpers'

export const StatusPill = ({ text }) => (
  <span
    className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap ${
      STATUS_PILL[text] || 'bg-gray-100 text-gray-600 border-gray-200'
    }`}
  >
    {text}
  </span>
)

export default function ReportTable({ headers, rows, alignments = [], totalsRow = null, statusCols = [], emptyMessage = 'No records in this period.' }) {
  const align = (i) => (alignments[i] === 'right' ? 'text-right' : alignments[i] === 'center' ? 'text-center' : 'text-left')
  return (
    <div className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[860px]">
          <thead>
            <tr className="bg-brand-700 text-white text-[11px] uppercase tracking-wider">
              {headers.map((h, i) => (
                <th key={i} className={`px-5 py-3.5 font-semibold whitespace-nowrap ${align(i)}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-5 py-10 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {rows.map((r, ri) => (
              <tr key={ri} className={ri % 2 === 1 ? 'bg-gray-50/70' : ''}>
                {r.map((cell, ci) => {
                  const isStatus = statusCols.includes(ci)
                  return (
                    <td
                      key={ci}
                      className={`px-5 py-3 whitespace-nowrap ${isStatus ? 'text-center' : align(ci)} ${isStatus ? '' : 'tabular-nums'}`}
                    >
                      {isStatus ? <StatusPill text={String(cell ?? '')} /> : cell}
                    </td>
                  )
                })}
              </tr>
            ))}
            {totalsRow && (
              <tr className="bg-teal-50/60 border-t-[3px] border-double border-brand-700">
                {totalsRow.map((cell, ci) => (
                  <td key={ci} className={`px-5 py-3.5 font-bold text-ink tabular-nums whitespace-nowrap ${align(ci)}`}>
                    {ci === 0 ? 'TOTAL' : cell}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}