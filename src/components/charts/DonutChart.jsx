/**
 * DonutChart — pure SVG interactive donut chart for proportions
 * (e.g. stock valuation by category, stock-out reasons).
 * Features hover highlight, center summary, and legend with percentages.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChartContainer from './ChartContainer'

export default function DonutChart({
  title,
  subtitle,
  data = [],
  valuePrefix = '',
  valueSuffix = '',
  centerLabel = 'Total Value',
  height = 'h-64',
  ...rest
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const defaultColors = ['#10863c', '#43c07e', '#0284c7', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6']

  const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0)

  // Compute angles for each slice
  const radius = 68
  const strokeWidth = 24
  const circumference = 2 * Math.PI * radius

  let accumulatedPercent = 0
  const slices = data.map((item, idx) => {
    const val = Number(item.value) || 0
    const percent = total > 0 ? (val / total) : 0
    const strokeDasharray = `${percent * circumference} ${circumference}`
    const strokeDashoffset = -accumulatedPercent * circumference
    accumulatedPercent += percent

    return {
      ...item,
      color: item.color || defaultColors[idx % defaultColors.length],
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
    }
  })

  const activeItem = hoveredIdx !== null ? slices[hoveredIdx] : null

  return (
    <ChartContainer title={title} subtitle={subtitle} empty={!data.length || total === 0} height={height} {...rest}>
      <div className="flex h-full flex-col sm:flex-row items-center justify-center gap-6">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center shrink-0 overflow-hidden" style={{ maxWidth: 180, maxHeight: 180 }}>
          <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
            {/* Background ring */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
            />

            {/* Slices */}
            {slices.map((slice, idx) => (
              <motion.circle
                key={slice.label || idx}
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: slice.strokeDashoffset }}
                transition={{ duration: 0.8, delay: idx * 0.08 }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-all duration-200"
              />
            ))}
          </svg>

          {/* Center text */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-3 max-w-full">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-brand-600 truncate max-w-full">
              {activeItem ? activeItem.label : centerLabel}
            </span>
            <span className="text-base font-bold tracking-tight tabular-nums text-ink mt-0.5 leading-tight break-all max-w-full">
              {activeItem
                ? `${valuePrefix}${Number(activeItem.value).toLocaleString()}${valueSuffix}`
                : `${valuePrefix}${total.toLocaleString()}${valueSuffix}`}
            </span>
            {activeItem && (
              <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded-full mt-0.5">
                {activeItem.percent}% share
              </span>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 min-w-0 max-h-48 overflow-y-auto pr-1 space-y-1.5 w-full">
          {slices.map((slice, idx) => (
            <div
              key={slice.label || idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer ${
                hoveredIdx === idx ? 'bg-gray-50 -translate-x-0.5' : 'hover:bg-gray-50/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="text-xs font-medium text-ink truncate">{slice.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-gray-500 tabular-nums truncate max-w-[100px]">
                  {valuePrefix}{Number(slice.value).toLocaleString()}{valueSuffix}
                </span>
                <span className="text-xs font-semibold text-gray-400 w-8 text-right">
                  {slice.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  )
}