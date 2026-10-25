/**
 * BarChart — pure SVG interactive bar chart for report comparisons.
 * Fixed-height plot (320px) scaled to the container width so bars are never
 * distorted. Uses "nice" rounded Y-axis ticks, sparse X-axis labels, a
 * grouped hover tooltip listing every series, and an always-visible legend.
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChartContainer from './ChartContainer'

const useElementWidth = () => {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    if (ro) ro.observe(el)
    return () => ro?.disconnect()
  }, [])
  return [ref, width]
}

/* Round values up to clean tick boundaries: 0,5,10,15 / 0,20,40,60,80,100… */
const niceScale = (maxValue) => {
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]
  const raw = Math.max(1, maxValue)
  const step = steps.find((s) => Math.ceil(raw / s) <= 6) || 10000
  const maxTick = step * Math.ceil(raw / step)
  const ticks = []
  for (let v = 0; v <= maxTick; v += step) ticks.push(v)
  return { ticks, maxTick }
}

const labelOf = (item) => {
  const raw = String(item.label ?? item.date ?? '')
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(raw)
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  return raw
}

const shortLabel = (label) => (label.length > 8 ? `${label.slice(0, 7)}…` : label)

export default function BarChart({
  title,
  subtitle,
  data = [],
  series = null,
  valuePrefix = '',
  valueSuffix = '',
  height = 'h-[320px]',
  loading = false,
  emptyText = 'No chart data available',
  ...rest
}) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const [wrapperRef, width] = useElementWidth()

  const defaultSeries = [{ key: 'value', label: 'Total', color: '#10863c' }]
  const activeSeries = series || defaultSeries

  const total = data.reduce(
    (sum, d) => sum + activeSeries.reduce((s, k) => s + (Number(d[k.key] ?? d.value ?? 0) || 0), 0),
    0
  )
  const maxValue = Math.max(
    1,
    ...data.flatMap((d) => activeSeries.map((s) => Number(d[s.key] ?? d.value ?? 0)))
  )
  const { ticks, maxTick } = niceScale(maxValue)

  const PLOT_H = 280
  const PAD = { l: 46, r: 12, t: 12, b: 26 }
  const usableH = PLOT_H - PAD.t - PAD.b
  const usableW = Math.max(1, width - PAD.l - PAD.r)
  const n = data.length
  const band = n > 0 ? usableW / n : usableW
  const barW = Math.max(2, Math.min(18, (band * 0.7) / activeSeries.length))

  const labelStep = Math.max(1, Math.round(n / 6))

  return (
    <ChartContainer title={title} subtitle={subtitle} loading={loading} empty={!n || total === 0} emptyText={emptyText} height={height} {...rest}>
      <div className="h-full flex flex-col">
        <div ref={wrapperRef} className="relative flex-1 min-h-0">
          <svg width={width} height={PLOT_H} className="overflow-visible" role="img" aria-label={title}>
            {/* Grid lines + Y ticks */}
            {ticks.map((val) => {
              const y = PAD.t + usableH * (1 - val / maxTick)
              return (
                <g key={val}>
                  <line
                    x1={PAD.l}
                    y1={y}
                    x2={width - PAD.r}
                    y2={y}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                    strokeDasharray={val === 0 ? 'none' : '3 3'}
                  />
                  <text x={PAD.l - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#9ca3af" fontFamily="sans-serif">
                    {val}
                  </text>
                </g>
              )
            })}

            {/* Grouped bars */}
            {data.map((item, idx) => {
              const groupX = PAD.l + idx * band + (band - barW * activeSeries.length) / 2
              return (
                <g key={idx}>
                  <rect
                    x={PAD.l + idx * band}
                    y={PAD.t}
                    width={band}
                    height={usableH}
                    fill="transparent"
                    onMouseEnter={() => setHoverIdx(idx)}
                    onMouseLeave={() => setHoverIdx(null)}
                    className="cursor-pointer"
                  />
                  {activeSeries.map((s, sIdx) => {
                    const rawVal = Number(item[s.key] ?? item.value ?? 0)
                    const barH = (rawVal / maxTick) * usableH
                    const x = groupX + sIdx * barW
                    const y = PAD.t + usableH - barH
                    return (
                      <motion.rect
                        key={s.key}
                        initial={{ height: 0, y: PAD.t + usableH }}
                        animate={{ height: Math.max(0, barH), y }}
                        transition={{ duration: 0.5, delay: idx * 0.02 }}
                        x={x}
                        width={Math.max(1, barW - (activeSeries.length > 1 ? 3 : 0))}
                        rx="3"
                        fill={s.color || '#10863c'}
                        style={{ opacity: hoverIdx !== null && hoverIdx !== idx ? 0.45 : 1 }}
                        className="transition-opacity duration-200"
                      />
                    )
                  })}

                  {/* Sparse X-axis labels */}
                  {(idx % labelStep === 0 || idx === n - 1) && (
                    <text
                      x={PAD.l + idx * band + band / 2}
                      y={PLOT_H - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6b7280"
                      fontWeight="500"
                      fontFamily="sans-serif"
                    >
                      {shortLabel(labelOf(item))}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Hover tooltip — all series for the hovered day */}
          <AnimatePresence>
            {hoverIdx !== null && data[hoverIdx] && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="pointer-events-none absolute z-20 rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-xl"
                style={{
                  left: `${Math.min(88, Math.max(12, ((PAD.l + hoverIdx * band + band / 2) / Math.max(1, width)) * 100))}%`,
                  top: `${Math.max(0, (PAD.t / PLOT_H) * 100 - 2)}%`,
                  transform: 'translate(-50%, 0)',
                }}
              >
                <div className="text-xs font-semibold mb-1">{labelOf(data[hoverIdx])}</div>
                {activeSeries.map((s) => {
                  const val = Number(data[hoverIdx][s.key] ?? data[hoverIdx].value ?? 0)
                  return (
                    <div key={s.key} className="flex items-center gap-1.5 text-xs text-gray-300">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span>{s.label}:</span>
                      <span className="font-bold text-white tabular-nums">{valuePrefix}{val.toLocaleString()}{valueSuffix}</span>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4 pt-1">
          {activeSeries.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  )
}