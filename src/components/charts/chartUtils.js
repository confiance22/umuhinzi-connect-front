export function getNiceTicks(maxValue, intervalCount = 4) {
  const value = Math.max(1, Number(maxValue) || 1)
  let rawStep = value / intervalCount
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(1, rawStep))))
  const norm = rawStep / mag
  let step
  if (norm <= 1) step = 1
  else if (norm <= 2) step = 2
  else if (norm <= 2.5) step = 2.5
  else if (norm <= 5) step = 5
  else step = 10
  step = Math.max(1, step * mag)
  const niceMax = step * intervalCount
  const ticks = Array.from({ length: intervalCount + 1 }, (_, i) => i * step)
  return { ticks, niceMax, step }
}

export function getSmoothPath(points) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`
  }
  let d = `M ${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }
  return d
}