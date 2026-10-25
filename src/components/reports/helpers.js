/**
 * helpers.js — shared formatting/status helpers for the four report pages.
 * Kept outside the page components so every report (Overall Summary,
 * Stock In, Stock Out, All Products) formats numbers, dates and status
 * pills identically.
 */
import { formatCurrency } from '../../utils/formatCurrency'

export const commaN = (n) => (Number.isFinite(Number(n)) ? Math.round(Number(n)).toLocaleString('en-US') : String(n ?? '—'))

export const fmtDate = (iso) => new Date(iso).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })

export const fmtQty = (n, unit = '') => `${commaN(n)} ${unit}`.trim()

export const formatCurrencyTotals = (totals, indices) => {
  if (!totals) return totals
  indices.forEach((idx) => {
    const raw = Number(totals[idx])
    if (Number.isFinite(raw)) totals[idx] = formatCurrency(raw)
  })
  return totals
}

/* ── Thresholds for the value-vs-valuation status indicator ── */
export const VALUE_STATUS = {
  HIGH: { label: 'High Value', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  MEDIUM: { label: 'Medium Value', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  LOW: { label: 'Low Value', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
}

export const STATUS_PILL = {
  'OUT OF STOCK': 'bg-rose-100 text-rose-700 border-rose-200',
  'LOW STOCK': 'bg-amber-100 text-amber-700 border-amber-200',
  OK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ...Object.fromEntries(Object.values(VALUE_STATUS).map((v) => [v.label, v.cls])),
}

export const statusOfValue = (pct) => {
  const p = Number(pct) || 0
  if (p >= 25) return VALUE_STATUS.HIGH
  if (p >= 10) return VALUE_STATUS.MEDIUM
  return VALUE_STATUS.LOW
}

export const stamp = (slug, periodLabel) =>
  `StockRwa-${slug}-Report-${periodLabel.replace(/[^a-zA-Z0-9]+/g, '-')}`