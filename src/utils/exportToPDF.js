/**
 * exportToPDF.js — corporate, print-ready PDF reports (jsPDF, A4 portrait).
 *
 * Design system:
 *   • Palette   Navy Blue (#0F172A) · Slate Gray (#64748B) · Teal accents (#0D9488)
 *   • Masthead  Top navy rule, logo, company name + tagline, doc-type metadata
 *   • Header    Clear hierarchy — title, wrapped subtitle, 3-column meta band
 *   • Metrics   Key Metrics summary boxes with teal accent tops
 *   • Table     Navy header band, grid lines, zebra rows, right-aligned
 *               currency, optional % heat-bars and status pills, and a bold
 *               TOTAL row separated by a double rule
 *   • Footer    Page numbers + generation timestamp on every page
 *
 * Falls back gracefully if the logo cannot be embedded.
 */
import jsPDF from 'jspdf'
import { APP_NAME, APP_TAGLINE, getLogo } from './branding'

/* ── Palettes ──
 * 'shop'     → navy + teal (shop-manager reports)
 * 'platform' → executive black + gold (Super Admin platform reports)
 * `dark` drives masthead/table header/title, `accent` the labels & rules,
 * `tint`/`bar` the summary + total fills; neutrals are shared across skins. */
const THEMES = {
  shop: {
    dark: [15, 23, 42],
    accent: [13, 148, 136],
    tint: [239, 249, 248],
    bar: [204, 251, 241],
    mastLabel: 'ACCOUNTING · AUDIT · INVENTORY',
    mastNote: 'CONFIDENTIAL COMPANY REPORT',
  },
  platform: {
    dark: [17, 17, 20],
    accent: [184, 134, 11],
    tint: [251, 246, 233],
    bar: [240, 226, 182],
    mastLabel: 'PLATFORM ADMINISTRATION · GOVERNANCE',
    mastNote: 'CONFIDENTIAL PLATFORM REPORT',
  },
}
const SLATE = [100, 116, 139]
const SLATE_LIGHT = [148, 163, 184]
const GRID = [226, 232, 240]
const ZEBRA = [248, 250, 252]
const INK = [10, 10, 10]

const COLORS = {
  high: [13, 148, 136],
  medium: [71, 85, 105],
  low: [148, 163, 184],
  critical: [220, 38, 38],
}

export async function exportReportPDF({
  skin = 'shop',
  shopName = 'My Shop',
  reportTitle = 'Report',
  subtitle = '',
  periodLabel = '',
  generatedBy = '',
  headers = [],
  rows = [],
  filename = 'StockRwa-Report',
  alignments = [],
  footNote = '',
  summary = null,
  summaryCards = null,
  totalsRow = null,
  barCols = [],
  statusCols = [],
  photos = [],
}) {
  if (!rows || !rows.length) return

  const t = THEMES[skin] || THEMES.shop
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const M = 40
  const usable = pageWidth - M * 2

  const logo = await getLogo()
  const logoRatio = logo.width && logo.height ? logo.width / logo.height : 1
  const logoH = 26
  const logoW = Math.min(64, logoH * logoRatio)

  /* ── Product photos: embed as circular thumbnails in the first column.
     Remote URLs are fetched to data URLs up-front (like the logo) so each
     row can draw its image; failures fall back to a neutral grey disc ── */
  const hasPhotos = Array.isArray(photos) && photos.some(Boolean)
  const photoMeta = new Map()
  if (hasPhotos) {
    const blobToDataUrl = (blob) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      })
    const unique = [...new Set(photos.filter(Boolean))]
    await Promise.all(
      unique.map(async (url) => {
        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error('fetch failed')
          const blob = await res.blob()
          const dataUrl = await blobToDataUrl(blob)
          photoMeta.set(url, { dataUrl, mime: blob.type || 'image/jpeg' })
        } catch {
          photoMeta.set(url, null)
        }
      })
    )
  }
  const PHOTO_SIZE = 16

  const generatedAt = new Date().toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })
  const comma = (n) => (Number.isFinite(Number(n)) ? Math.round(Number(n)).toLocaleString('en-US') : String(n ?? '—'))

  /* ── Column widths: weighted by header length, capped for long text ── */
  const headerLens = headers.map((h, c) => {
    const maxData = rows.reduce((m, r) => Math.max(m, String(r[c] ?? '').length), 0)
    return Math.max(String(h).length, Math.min(maxData, 30))
  })
  const totalWeight = headerLens.reduce((s, n) => s + n, 0) || 1
  const minW = 34
  const colW = headerLens.map((n) => Math.max(minW, Math.round((n / totalWeight) * usable)))
  const used = colW.reduce((s, n) => s + n, 0)
  colW[colW.length - 1] += usable - used // absorb rounding into last column

  // Reserve room for the circular photo in the first column when photos exist,
  // then re-balance the last column so widths still fill the page.
  if (hasPhotos && colW.length) {
    colW[0] = Math.max(colW[0], PHOTO_SIZE + 18)
    const used2 = colW.reduce((s, n) => s + n, 0)
    colW[colW.length - 1] += usable - used2
  }

  /* Bar scale: normalize each visual column to its own max so the top value
     fills the bar cleanly regardless of the absolute numbers involved. */
  const barMax = {}
  barCols.forEach((c) => {
    const vals = rows.map((r) => parseFloat(String(r[c] ?? '').replace(/[^0-9.-]/g, ''))).filter((n) => Number.isFinite(n))
    barMax[c] = vals.length ? Math.max(...vals, 1) : 100
  })

  const HEADER_FS = 8
  const DATA_FS = 7.5
  const LINE_H = 9.5

  const colAlign = (i) => (alignments[i] === 'right' ? 'right' : alignments[i] === 'center' ? 'center' : 'left')

  const textLines = (text, colIdx, size) => {
    doc.setFont('helvetica', size === 'h' ? 'bold' : 'normal')
    doc.setFontSize(size === 'h' ? HEADER_FS : DATA_FS)
    const remain = hasPhotos && colIdx === 0 ? Math.max(10, colW[0] - PHOTO_SIZE - 14) : colW[colIdx] - 10
    return doc.splitTextToSize(String(text ?? '—'), remain)
  }

  const rowHeightFor = (cells, size) => {
    doc.setFont('helvetica', size === 'h' ? 'bold' : 'normal')
    doc.setFontSize(size === 'h' ? HEADER_FS : DATA_FS)
    let maxLines = 1
    cells.forEach((c, i) => {
      // First column holds the photo — measure text in the space beside it
      const remain = hasPhotos && i === 0 ? Math.max(10, colW[0] - PHOTO_SIZE - 10) : colW[i] - 10
      const lines = doc.splitTextToSize(String(c ?? '—'), remain).length
      maxLines = Math.max(maxLines, lines)
    })
    return Math.max(size === 'h' ? 22 : 18, hasPhotos ? PHOTO_SIZE + 10 : 0, maxLines * LINE_H + 8)
  }

  /* ═════════════════════ PAGE 1 HEADER ═════════════════════ */
  let y = 30

  // Top navy rule (corporate masthead rule)
  doc.setFillColor(...t.dark)
  doc.rect(M, 22, usable, 2.2, 'F')

  // Logo + company block
  if (logo?.dataUrl) {
    try {
      doc.addImage(logo.dataUrl, 'PNG', M, 30, logoW, logoH)
    } catch {
      /* logo could not be embedded — continue without it */
    }
  }
  const mastX = M + logoW + 12
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...t.dark)
  doc.text(shopName, mastX, 43)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...SLATE)
  doc.text(`${APP_NAME} — ${APP_TAGLINE}`.toUpperCase(), mastX, 51)

  // Right-side document metadata
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...t.accent)
  doc.text(t.mastLabel, pageWidth - M, 43, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...SLATE_LIGHT)
  doc.text(t.mastNote, pageWidth - M, 51, { align: 'right' })

  y = 68
  doc.setDrawColor(...GRID)
  doc.setLineWidth(0.8)
  doc.line(M, y, pageWidth - M, y)
  y += 14

  // Title + wrapped subtitle
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(...t.dark)
  doc.text(reportTitle, M, y)
  y += 15
  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...SLATE)
    const sub = doc.splitTextToSize(subtitle, usable)
    sub.forEach((ln) => {
      doc.text(ln, M, y)
      y += 10.5
    })
    y += 3
  } else {
    y += 5
  }

  // Meta band — Reporting Period | Generated | Prepared by
  const bandH = 30
  doc.setFillColor(...ZEBRA)
  doc.roundedRect(M, y, usable, bandH, 3, 3, 'F')
  const bandLeft = M + 14
  const metaY = y + 18
  const metaCols = [
    { label: 'REPORTING PERIOD', value: periodLabel || 'All recorded activity' },
    { label: 'GENERATED', value: generatedAt },
    { label: 'PREPARED BY', value: generatedBy || 'Shop Manager' },
  ]
  const colW3 = usable / 3
  metaCols.forEach((mc, i) => {
    const cx = M + i * colW3
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(...SLATE)
    doc.text(mc.label, bandLeft + i * colW3, metaY - 9)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...t.dark)
    doc.text(mc.value, bandLeft + i * colW3, metaY + 2)
    if (i > 0) {
      doc.setDrawColor(...GRID)
      doc.setLineWidth(0.6)
      doc.line(cx, metaY - 12, cx, metaY + 4)
    }
  })
  y += bandH + 14

  /* ═════════════════════ KEY METRICS ═════════════════════ */
  const customCards = Array.isArray(summaryCards) && summaryCards.length ? summaryCards : null
  const hasSummary = customCards || (summary && Object.values(summary).some((v) => v != null))
  if (hasSummary) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...t.accent)
    doc.text('KEY METRICS', M, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...SLATE)
    doc.text('Report summary across the selected period', pageWidth - M, y, { align: 'right' })
    y += 7

    const items =
      customCards ||
      [
        { label: 'Stock In', value: `${comma(summary.totalIn ?? 0)} units` },
        { label: 'Stock Out', value: `${comma(summary.totalOut ?? 0)} units` },
        { label: 'Net Flow', value: `${(summary.netFlow ?? 0) >= 0 ? '+' : ''}${comma(summary.netFlow ?? 0)} units` },
        { label: 'Movements', value: `${comma(summary.movementCount ?? 0)} logs` },
      ]
    if (!customCards && summary && summary.totalValuation != null)
      items.push({ label: 'Total Valuation', value: `RWF ${comma(summary.totalValuation)}` })

    const gap = 8
    const boxH = 42
    const boxW = (usable - gap * (items.length - 1)) / items.length
    const pad = 9
    const maxValueW = boxW - pad * 2
    items.forEach((it, i) => {
      const bx = M + i * (boxW + gap)
      doc.setFillColor(...ZEBRA)
      doc.roundedRect(bx, y, boxW, boxH, 4, 4, 'F')
      doc.setFillColor(...t.accent)
      doc.rect(bx, y, boxW, 2.5, 'F') // teal accent top
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6)
      doc.setTextColor(...SLATE)
      doc.text(it.label.toUpperCase(), bx + 9, y + 15)
      // shrink-to-fit the value so long currency totals (e.g. RWF 28,533,800,000)
      // stay fully inside the card with right-side padding
      let fs = 10
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(fs)
      while (doc.getTextWidth(it.value) > maxValueW && fs > 6) {
        fs -= 0.5
        doc.setFontSize(fs)
      }
      doc.setTextColor(...t.dark)
      doc.text(it.value, bx + boxW - pad, y + 28, { align: 'right' })
    })
    y += boxH + 16
  } else {
    y += 6
  }

  /* ═════════════════════ DETAILED BREAKDOWN TABLE ═════════════════════ */
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...t.accent)
  doc.text('DETAILED BREAKDOWN', M, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...SLATE)
  doc.text(`${comma(rows.length)} ${rows.length === 1 ? 'record' : 'records'} across reporting period`, pageWidth - M, y, { align: 'right' })
  y += 8

  const headerRowHeight = rowHeightFor(headers, 'h')
  const drawHeaderRow = () => {
    doc.setFillColor(...t.dark)
    doc.rect(M, y, usable, headerRowHeight, 'F')
    let x = M
    headers.forEach((h, i) => {
      const align = colAlign(i)
      const lines = textLines(h, i, 'h')
      const blockH = lines.length * LINE_H
      const ty = y + 3 + (headerRowHeight - blockH) / 2
      doc.setTextColor(255, 255, 255)
      lines.forEach((line, idx) => {
        const lineX = align === 'right' ? x + colW[i] - 8 - doc.getTextWidth(line) : x + 6
        doc.text(line, lineX, ty + idx * LINE_H)
      })
      x += colW[i]
    })
    y += headerRowHeight
  }

  const statusStyle = (text) => {
    const t = String(text || '')
    if (/out of stock|critical/i.test(t)) return COLORS.critical
    if (/high/i.test(t)) return COLORS.high
    if (/medium/i.test(t)) return COLORS.medium
    if (/low/i.test(t)) return COLORS.low
    return null
  }

  drawHeaderRow()

  /* ── Data rows ── */
  rows.forEach((row, r) => {
    const rh = rowHeightFor(row, '')
    if (y + rh > pageHeight - 58) {
      doc.addPage()
      y = 44
      drawHeaderRow()
    }
    if (r % 2 === 1) {
      doc.setFillColor(...ZEBRA)
      doc.rect(M, y, usable, rh, 'F')
    }
    let x = M
    headers.forEach((_, c) => {
      const align = colAlign(c)
      const raw = String(row[c] ?? '—')

      // % heat-bar visual
      if (barCols.includes(c)) {
        const num = parseFloat(raw.replace(/[^0-9.-]/g, ''))
        const pct = Number.isFinite(num) ? Math.max(0, Math.min(100, (num / barMax[c]) * 100)) : 0
        const barTop = y + 3
        const barH = rh - 7
        doc.setFillColor(...t.bar)
        doc.roundedRect(x + 6, barTop, Math.max(2, (colW[c] - 16) * (pct / 100)), barH, 2, 2, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(DATA_FS)
        doc.setTextColor(...t.dark)
        doc.text(raw, x + colW[c] - 8, barTop + barH / 2 + 2.5, { align: 'right' })
      } else if (statusCols.includes(c)) {
        const color = statusStyle(raw)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(DATA_FS)
        if (color) {
          const pillH = 12
          const tw = Math.min(doc.getTextWidth(raw) + 10, colW[c] - 12)
          const pillY = y + (rh - pillH) / 2
          doc.setFillColor(...color)
          doc.roundedRect(x + 6, pillY, tw, pillH, pillH / 2, pillH / 2, 'F')
          doc.setTextColor(255, 255, 255)
          doc.text(raw, x + 6 + (tw - doc.getTextWidth(raw)) / 2, pillY + pillH / 2 + 2.5)
        } else {
          doc.setTextColor(...INK)
          doc.text(raw, x + 6, y + 3 + (rh - LINE_H) / 2 + LINE_H * 0.85)
        }
      } else {
        // Circular product photo in the first column (beside the name)
        let textOffsetX = 6
        const offsetAlign = align
        if (hasPhotos && c === 0) {
          const size = PHOTO_SIZE
          const cx = x + 6 + size / 2
          const cy = y + rh / 2
          const discR = size / 2
          doc.setFillColor(...t.bar)
          doc.circle(cx, cy, discR, 'FD')
          const url = photos[r]
          const meta = url ? photoMeta.get(url) : null
          if (meta) {
            try {
              const mime = String(meta.mime || '').toLowerCase()
              const fmt = mime.includes('png') ? 'PNG' : mime.includes('webp') ? 'WEBP' : mime.includes('svg') ? 'SVG' : 'JPEG'
              doc.saveGraphicsState()
              doc.circle(cx, cy, discR)
              doc.clip()
              doc.addImage(meta.dataUrl, fmt, cx - discR, cy - discR, size, size)
              doc.restoreGraphicsState()
            } catch {
              /* fall back to grey disc with initial */
            }
          } else {
            const initial = String(raw).trim().charAt(0).toUpperCase() || '?'
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(8)
            doc.setTextColor(255, 255, 255)
            doc.text(initial, cx, cy + 2.5, { align: 'center' })
          }
          textOffsetX = size + 12
        }

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(DATA_FS)
        const lines = textLines(raw, c, '')
        const blockH = lines.length * LINE_H
        const ty = y + 3 + (rh - blockH) / 2
        doc.setTextColor(...INK)
        lines.forEach((line, idx) => {
          const lineX =
            offsetAlign === 'right'
              ? x + colW[c] - 8 - doc.getTextWidth(line)
              : x + textOffsetX
          doc.text(line, lineX, ty + idx * LINE_H)
        })
      }

      // grid line per cell (full grid requested)
      doc.setDrawColor(...GRID)
      doc.setLineWidth(0.4)
      doc.rect(x, y, colW[c], rh)
      x += colW[c]
    })
    y += rh
  })

  /* ── TOTAL row: bold, teal-tinted, separated by a double rule ── */
  if (totalsRow) {
    const rh = rowHeightFor(totalsRow, 'h')
    if (y + rh > pageHeight - 58) {
      doc.addPage()
      y = 44
      drawHeaderRow()
    }
    // double rule above the row
    doc.setDrawColor(...t.accent)
    doc.setLineWidth(1.2)
    doc.line(M, y, pageWidth - M, y)
    doc.line(M, y - 3, pageWidth - M, y - 3)

    doc.setFillColor(...t.tint)
    doc.rect(M, y, usable, rh, 'F')
    let x = M
    headers.forEach((_, c) => {
      const align = colAlign(c)
      const lines = textLines(totalsRow[c], c, 'h')
      const blockH = lines.length * LINE_H
      const ty = y + 3 + (rh - blockH) / 2
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(HEADER_FS)
      doc.setTextColor(...t.dark)
      lines.forEach((line, idx) => {
        const lineX = align === 'right' ? x + colW[c] - 8 - doc.getTextWidth(line) : x + 6
        doc.text(line, lineX, ty + idx * LINE_H)
      })
      doc.setDrawColor(...GRID)
      doc.setLineWidth(0.4)
      doc.rect(x, y, colW[c], rh)
      x += colW[c]
    })
    // closing rule under TOTAL
    doc.setDrawColor(...t.accent)
    doc.setLineWidth(1.2)
    doc.line(M, y + rh, pageWidth - M, y + rh)
    y += rh
  }

  if (footNote) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7)
    doc.setTextColor(...SLATE_LIGHT)
    doc.text(footNote, M, Math.min(y + 14, pageHeight - 48))
  }

  /* ═════════════════════ FOOTER (every page) ═════════════════════ */
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const yLine = pageHeight - 30
    doc.setDrawColor(...t.dark)
    doc.setLineWidth(1)
    doc.line(M, yLine, pageWidth - M, yLine)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(...t.dark)
    doc.text(`${APP_NAME} · ${shopName}`, M, yLine + 10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...SLATE)
    doc.text(`Generated ${generatedAt}`, M, yLine + 18.5)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...t.dark)
    doc.text(String(reportTitle).slice(0, 64), pageWidth / 2, yLine + 10, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - M, yLine + 10, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...SLATE)
    doc.text(periodLabel || '', pageWidth - M, yLine + 18.5, { align: 'right' })
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}

/**
 * Backwards-compatible legacy signature:
 *   exportTableToPDF(title, headers, rows, filename)
 * Kept for any existing call sites that were not migrated yet.
 */
export function exportTableToPDF(title = 'Report', headers = [], rows = [], filename = 'report.pdf') {
  return exportReportPDF({ reportTitle: title, headers, rows, filename })
}

export default exportReportPDF