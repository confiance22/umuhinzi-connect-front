/**
 * reportTotals.js — shared helper that gives exports a professional finished
 * look: a trailing TOTAL row summed over the numeric columns of a table.
 *
 * Column detection is keyword-based on the header (e.g. "Cartons", "Qty",
 * "Value (RWF)") so it stays safe for any report tab.
 */
const NUMERIC_HEADER =
  /^(cartons|loose pieces|pieces|qty|value\b|total\b|valuation|deficit|estimated restock cost|est\. restock cost|est restock cost|current stock|stock on hand|products|units in stock|units received|units removed|movements|stock in\b|stock out\b)/i

const toNumber = (v) => {
  const cleaned = String(v ?? '').replace(/[^0-9.-]/g, '')
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return NaN
  return Number(cleaned)
}

export function buildTotalsRow(headers = [], rows = []) {
  const sums = headers.map((h) => (NUMERIC_HEADER.test(String(h)) ? 0 : null))
  if (sums.every((s) => s === null)) return null

  rows.forEach((row) => {
    row.forEach((cell, c) => {
      if (sums[c] === null) return
      const n = toNumber(cell)
      if (!Number.isNaN(n)) sums[c] += n
    })
  })

  const totals = headers.map((h, c) => {
    if (sums[c] === null) return ''
    const rounded = Math.round(sums[c])
    return sums[c] === rounded ? sums[c] : Math.round(sums[c] * 100) / 100
  })
  totals[0] = 'TOTAL'
  return totals
}