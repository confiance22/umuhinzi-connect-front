/**
 * exportToCSV.js — client-side CSV export (Blob + download anchor) for tables
 * such as stock history, product lists and report breakdowns.
 *
 * An optional `meta` block gives exports a professional feel:
 * an opening brand/title/period preamble and a trailing TOTAL row.
 */
export function exportToCSV(headers = [], rows = [], filename = 'report.csv', meta = {}) {
  if (!rows || !rows.length) return
  const escapeCell = (cell) => {
    if (cell === null || cell === undefined) return '""'
    const str = String(cell).replace(/"/g, '""')
    return `"${str}"`
  }

  const lines = []

  const { appName = 'StockRwa — Inventory Control & Audit System', shopName = '', reportTitle = '', periodLabel = '', generatedBy = '', totalsRow = null, classification = '' } = meta
  if (reportTitle) {
    if (appName) lines.push([appName])
    if (shopName) lines.push([shopName])
    lines.push([reportTitle])
    if (classification) lines.push([classification])
    const metaBits = []
    if (periodLabel) metaBits.push(`Period: ${periodLabel}`)
    metaBits.push(`Generated: ${new Date().toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })}`)
    if (generatedBy) metaBits.push(`Prepared by: ${generatedBy}`)
    lines.push(metaBits)
    lines.push([])
  }

  lines.push(headers.map(escapeCell).join(','))
  rows.forEach((row) => lines.push(row.map(escapeCell).join(',')))
  if (totalsRow) lines.push(totalsRow.map(escapeCell).join(','))

  const csvContent = '\uFEFF' + lines.map((line) => (Array.isArray(line) ? line.join(',') : line)).join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default exportToCSV