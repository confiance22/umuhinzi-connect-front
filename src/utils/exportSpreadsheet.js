/**
 * exportSpreadsheet.js — spreadsheet export.
 *
 * Produces a real .xlsx (Office Open XML) via a small dependency-free writer
 * (see ./xlsxWriter.js) — nothing external to load, so it always works.
 * Includes the brand logo as an embedded image, shop name, report title,
 * a teal meta band, a branded header row, zebra rows, a frozen header and an
 * optional footer. Opens directly in Excel / Google Sheets / LibreOffice.
 */
import { APP_NAME, APP_TAGLINE, getLogo } from './branding'
import { buildXlsx } from './xlsxWriter'

const dataUrlToBytes = (dataUrl) => {
  if (!dataUrl) return null
  const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

const downloadBuffer = (bytes, filename) => {
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportToXLS({
  skin = 'shop',
  shopName = 'My Shop',
  appName = APP_NAME,
  tagline = APP_TAGLINE,
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
}) {
  if (!rows || !rows.length) return

  const logo = await getLogo()
  const logoBytes = dataUrlToBytes(logo?.dataUrl)
  const generatedAt = new Date().toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })

  const bytes = buildXlsx({
    skin,
    shopName,
    appName,
    tagline,
    reportTitle,
    subtitle,
    periodLabel,
    generatedAt,
    generatedBy,
    headers,
    alignments,
    rows,
    footNote,
    summary,
    summaryCards,
    totalsRow,
    logoBytes,
  })

  downloadBuffer(bytes, filename)
}

export default exportToXLS