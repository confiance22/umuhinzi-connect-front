/**
 * formatCurrency.js — currency formatting for prices / stock valuation.
 * Defaults to RWF (Rwandan Franc). Central use of Intl.NumberFormat keeps
 * prices consistent across product cards, tables and reports.
 */
export function formatCurrency(amount, options = {}) {
  const num = Number(amount) || 0
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    ...options,
  }).format(num)
  return `RWF ${formatted}`
}

export default formatCurrency