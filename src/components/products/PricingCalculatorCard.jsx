/**
 * PricingCalculatorCard — a simple price helper for the shop manager.
 * Works out a suggested final selling price per piece from cost + taxes
 * + profit margin, then applies it to the product form's Piece Price field.
 * The piece price stays fully editable after applying.
 */
import React, { useState } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'

const fieldClass =
  'h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink placeholder:text-muted/55 font-semibold outline-none transition-all focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25'

export default function PricingCalculatorCard({ onApply }) {
  const [cost, setCost] = useState('')
  const [taxPct, setTaxPct] = useState('')
  const [profitPct, setProfitPct] = useState('')
  const [applied, setApplied] = useState(false)

  const costNum = cost === '' ? NaN : Number(cost)
  const taxNum = taxPct === '' ? 0 : Number(taxPct)
  const profitNum = profitPct === '' ? 0 : Number(profitPct)
  const valid =
    Number.isFinite(costNum) &&
    costNum > 0 &&
    Number.isFinite(taxNum) &&
    taxNum >= 0 &&
    Number.isFinite(profitNum) &&
    profitNum >= 0

  const taxed = valid ? costNum * (1 + taxNum / 100) : 0
  const finalPrice = valid ? Math.round(taxed * (1 + profitNum / 100)) : null
  const taxAmount = valid ? Math.round(taxed - costNum) : 0
  const profitAmount = finalPrice != null ? Math.round(finalPrice - taxed) : 0

  const handleInput = (setter) => (e) => {
    setter(e.target.value)
    setApplied(false)
  }

  const handleApply = () => {
    if (!valid || finalPrice == null) return
    onApply?.(finalPrice)
    setApplied(true)
  }

  return (
    <div className="rounded-2xl border border-line bg-card shadow-soft p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M8 18h8" />
            </svg>
            Price Calculator
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Final piece price = cost + taxes + profit.
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
          Piece Price
        </span>
      </div>

      <div className="space-y-3">
        {/* Cost */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">Cost price per piece (RWF)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400 pointer-events-none">RWF</span>
            <input
              type="number"
              min="0"
              step="50"
              value={cost}
              onChange={handleInput(setCost)}
              placeholder="e.g. 35000"
              className="h-11 w-full rounded-lg border border-line bg-white pl-14 pr-3.5 text-sm text-ink placeholder:text-muted/55 font-semibold outline-none transition-all focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25"
            />
          </div>
          {cost !== '' && !valid && (
            <p className="text-xs text-rose-500 mt-1">Enter a cost price above 0 to calculate.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">Taxes &amp; fees (%)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={taxPct}
              onChange={handleInput(setTaxPct)}
              placeholder="e.g. 18"
              className={fieldClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">Profit margin (%)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={profitPct}
              onChange={handleInput(setProfitPct)}
              placeholder="e.g. 25"
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="rounded-xl border border-line bg-page px-3.5 py-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Cost</span>
          <span className="font-semibold text-ink tabular-nums">{valid ? formatCurrency(costNum) : '—'}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>+ Taxes &amp; fees</span>
          <span className="font-semibold text-ink tabular-nums">{valid ? `+ ${formatCurrency(taxAmount)}` : '—'}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>+ Profit</span>
          <span className="font-semibold text-ink tabular-nums">{valid ? `+ ${formatCurrency(profitAmount)}` : '—'}</span>
        </div>
        <div className="border-t border-line pt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-ink">Final price per piece</span>
          <span className={`text-lg font-bold tabular-nums ${valid ? 'text-brand-800' : 'text-gray-400'}`}>
            {valid && finalPrice != null ? formatCurrency(finalPrice) : 'RWF —'}
          </span>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={handleApply}
          disabled={!valid}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
          Apply to Piece Price
        </button>
        {applied && (
          <p className="text-xs text-emerald-600 mt-2 flex items-start gap-1.5">
            <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
            Applied — Piece Price was updated. You can still change it above.
          </p>
        )}
      </div>
    </div>
  )
}