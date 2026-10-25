/**
 * LineChart — pure SVG interactive line chart with area gradient
 * for trend analytics (e.g. stock valuation trend, daily movement activity).
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChartContainer from './ChartContainer'

export default function LineChart({
  title,
  subtitle,
  data = [],
  color = '#10863c',
  valuePrefix = '',
  valueSuffix = '',
  height = 'h-64',
  ...rest
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const maxValue = Math.max(1, ...data.map((d) => Number(d.value || 0)))

  const chartWidth = 500
  const chartHeight = 180
  const paddingLeft = 40
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 35
  const usableWidth = chartWidth - paddingLeft - paddingRight
  const usableHeight = chartHeight - paddingTop - paddingBottom

  // Generate SVG coordinates
  const points = data.map((item, idx) => {
    const x = paddingLeft + (idx / Math.max(1, data.length - 1)) * usableWidth
    const val = Number(item.value || 0)
    const y = paddingTop + usableHeight - (val / maxValue) * usableHeight
    return { ...item, x, y, val }
  })

  // Polyline string
  const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ')
  // Area polygon string
  const areaString = points.length > 0
    ? `${points[0].x},${paddingTop + usableHeight} ${pointsString} ${points[points.length - 1].x},${paddingTop + usableHeight}`
    : ''

  const gradientId = `line-chart-grad-${title ? title.replace(/\s+/g, '-').toLowerCase() : 'def'}`

  return (
    <ChartContainer title={title} subtitle={subtitle} empty={!data.length} height={height} {...rest}>
      <div className="relative h-full w-full">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + usableHeight * (1 - ratio)
            const val = Math.round(maxValue * ratio)
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                  strokeDasharray={ratio === 0 ? 'none' : '3 3'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#9ca3af"
                  fontFamily="sans-serif"
                >
                  {val}
                </text>
              </g>
            )
          })}

          {/* Gradient Area under curve */}
          {points.length > 1 && (
            <polygon points={areaString} fill={`url(#${gradientId})`} />
          )}

          {/* The Trend Line */}
          {points.length > 1 && (
            <motion.polyline
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />
          )}

          {/* Point Circles & Invisible click/hover areas */}
          {points.map((p, idx) => (
            <g key={idx}>
              {/* X-axis label */}
              <text
                x={p.x}
                y={chartHeight - 12}
                textAnchor="middle"
                fontSize="9"
                fill="#6b7280"
                fontFamily="sans-serif"
              >
                {p.label}
              </text>

              {/* Point circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint === idx ? 6 : 3.5}
                fill="#ffffff"
                stroke={color}
                strokeWidth="2"
                className="transition-all duration-150"
              />

              {/* Larger hover target */}
              <circle
                cx={p.x}
                cy={p.y}
                r={16}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredPoint !== null && points[hoveredPoint] && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute z-20 rounded-xl bg-ink px-3 py-1.5 text-xs text-white shadow-xl"
              style={{
                left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
                top: `${Math.max(0, (points[hoveredPoint].y / chartHeight) * 100 - 24)}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="text-xs font-semibold text-gray-300">{points[hoveredPoint].label}</div>
              <div className="font-bold text-white tabular-nums">
                {valuePrefix}{points[hoveredPoint].val.toLocaleString()}{valueSuffix}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ChartContainer>
  )
}