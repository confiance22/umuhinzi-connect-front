/**
 * MetricCards — the exact card treatment used on the main dashboard:
 * clean white rounded cards with a subtle border + soft shadow and the
 * site's standard typography (tabular figures, bold value, muted label).
 * Long currency strings (e.g. "RWF 28,533,800,000") shrink automatically
 * so they never overflow the card width.
 */
import React, { useLayoutEffect, useRef, useState } from 'react'

export const FitText = ({ text, max = 26, min = 11, className = '', title = text }) => {
  const ref = useRef(null)
  const [style, setStyle] = useState({})

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const fit = () => {
      let lo = min
      let hi = max
      let best = min
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        el.style.fontSize = `${mid}px`
        if (el.scrollWidth <= el.clientWidth) {
          best = mid
          lo = mid + 1
        } else {
          hi = mid - 1
        }
      }
      el.style.fontSize = `${best}px`
      setStyle({ fontSize: `${best}px` })
    }

    fit()

    if (typeof ResizeObserver !== 'undefined') {
      const target = el.parentElement
      const ro = new ResizeObserver(() => fit())
      if (target) ro.observe(target)
      return () => ro.disconnect()
    }
    return undefined
  }, [text, max, min])

  return (
    <p
      ref={ref}
      style={style}
      title={title}
      className={`font-bold leading-tight tracking-tight tabular-nums whitespace-nowrap ${className}`}
    >
      {text}
    </p>
  )
}

const MetricCard = ({ label, value, sub, icon, accent }) => (
  <div
    className={`relative rounded-2xl border p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
      accent ? 'bg-ink border-ink' : 'bg-card border-line shadow-soft'
    }`}
  >
    {icon && (
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? 'bg-brand-700 text-white' : 'bg-page text-ink'}`}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </span>
    )}
    <FitText text={String(value)} className={`mt-3 ${accent ? 'text-white' : 'text-ink'}`} />
    <p className={`text-sm font-medium mt-0.5 truncate ${accent ? 'text-white/80' : 'text-muted'}`}>{label}</p>
    {sub && <p className={`text-xs mt-2 truncate ${accent ? 'text-white/50' : 'text-gray-400'}`}>{sub}</p>}
  </div>
)

const MetricCards = ({ items }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
    {items.map((it) => (
      <MetricCard key={it.label} {...it} />
    ))}
  </div>
)

export default MetricCards