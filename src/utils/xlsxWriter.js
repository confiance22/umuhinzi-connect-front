/**
 * xlsxWriter.js — dependency-free minimal .xlsx generator.
 *
 * Produces a valid Office Open XML spreadsheet (ZIP container, STORED
 * entries) using only browser-native APIs. No exceljs / jszip / fflate —
 * nothing to load, nothing to fail. The brand logo is anchored in its own
 * reserved top-left field (column A) so it never overlaps the text, which
 * starts at column B on the brand rows. Returns a Uint8Array ready to save.
 */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

const crc32 = (bytes) => {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const enc = new TextEncoder()
const encode = (s) => enc.encode(s)

const esc = (value) =>
  String(value ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const columnLetter = (col) => {
  let s = ''
  while (col > 0) {
    const rem = (col - 1) % 26
    s = String.fromCharCode(65 + rem) + s
    col = Math.floor((col - 1) / 26)
  }
  return s
}

const concatParts = (parts) => {
  const total = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(total)
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

const little = (u32) => new Uint8Array([u32 & 255, (u32 >>> 8) & 255, (u32 >>> 16) & 255, (u32 >>> 24) & 255])
const little2 = (u16) => new Uint8Array([u16 & 255, (u16 >>> 8) & 255])

/**
 * @returns Uint8Array holding the complete .xlsx file.
 */
export function buildXlsx(opts) {
  const {
    skin = 'shop',
    shopName = 'My Shop',
    appName = 'StockRwa',
    tagline = '',
    reportTitle = 'Report',
    subtitle = '',
    periodLabel = '',
    generatedAt = new Date().toLocaleString(),
    generatedBy = '',
    headers = [],
    alignments = [],
    rows = [],
    footNote = '',
    logoBytes = null,
    summary = null,
    summaryCards = null,
    totalsRow = null,
  } = opts

  /* Executive 'platform' skin swaps the shop teal for black + gold. */
  const THEME = {
    shop: { heading: 'FF0F766E', meta: 'FF134E4A', headerFont: 'FFFFFFFF', tint: 'FFF0FDFA', band: 'FF0F766E', zebra: 'FFF8FAFC' },
    platform: { heading: 'FFB8860B', meta: 'FF7A5B00', headerFont: 'FFE8C766', tint: 'FFFBF6E9', band: 'FF111114', zebra: 'FFFAF9F4' },
  }
  const theme = THEME[skin] || THEME.shop

  const hasSummary =
    summaryCards?.length || (summary && Object.values(summary).some((v) => v != null))
  const summaryText = summaryCards?.length
    ? summaryCards.map((c) => `${c.label}: ${c.value}`).join('    ·    ')
    : hasSummary
    ? [
        summary.totalValuation != null ? `Stock valuation: RWF ${Number(summary.totalValuation || 0).toLocaleString('en-US')}` : '',
        summary.totalIn != null ? `Total stock in: ${summary.totalIn} units` : '',
        summary.totalOut != null ? `Total stock out: ${summary.totalOut} units` : '',
        summary.netFlow != null ? `Net flow: ${(summary.netFlow >= 0 ? '+' : '')}${summary.netFlow} units` : '',
        summary.movementCount != null ? `Movement logs: ${summary.movementCount}` : '',
      ]
        .filter(Boolean)
        .join('    ·    ')
    : ''

  const hasLogo = Boolean(logoBytes && logoBytes.length)
  const startCol = hasLogo ? 1 : 0 // 0-indexed column where brand text begins
  const firstLetter = columnLetter(startCol + 1)
  const colCount = Math.max(headers.length, 1)
  const lastLetter = columnLetter(colCount)

  const headerRow = 6 + (hasSummary ? 1 : 0)
  const dataStart = headerRow + 1
  const lastDataRow = rows.length ? dataStart + rows.length - 1 : headerRow
  let lastRowIdx = lastDataRow
  const totalsIdx = lastDataRow + (totalsRow ? 1 : 0)
  if (totalsRow) lastRowIdx = totalsIdx
  const footIdx = totalsIdx + (footNote ? 1 : 0)
  if (footNote) lastRowIdx = footIdx

  const metaParts = []
  if (periodLabel) metaParts.push(`Report period: ${periodLabel}`)
  metaParts.push(`Generated: ${generatedAt}`)
  if (generatedBy) metaParts.push(`Prepared by: ${generatedBy}`)
  const metaText = metaParts.join('    ·    ')

  const inlineCell = (ref, style, value) =>
    `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${esc(value)}</t></is></c>`

  const alignStyles = { left: 9, center: 11, right: 13 }

  /* ── Brand block: rows 1–4, text starts at the `firstLetter` column ── */
  const brandCell = (row, style, value) => inlineCell(`${firstLetter}${row}`, style, value)
  const brandStyles = [null, 1, 2, 3, 4] // row index → style (1=shop, 2=tagline, 3=title, 4=subtitle)
  const brandValues = [null, shopName, `${appName} — ${tagline}`, reportTitle, subtitle]

  const brandRows = []
  const brandMerges = []
  if (hasLogo) {
    // place the logo in its own top-left field (column A)
    for (let r = 1; r <= (subtitle ? 4 : 3); r++) {
      brandRows.push(`<row r="${r}"${r === 1 ? ' ht="40" customHeight="1"' : r === 2 ? ' ht="14" customHeight="1"' : r === 4 ? ' ht="18" customHeight="1"' : ''}>${brandCell(r, brandStyles[r], brandValues[r])}</row>`)
      if (firstLetter !== lastLetter) brandMerges.push(`<mergeCell ref="${firstLetter}${r}:${lastLetter}${r}"/>`)
    }
  } else {
    brandRows.push(
      `<row r="1" ht="32" customHeight="1">${inlineCell('A1', 1, shopName)}${inlineCell('B1', 2, `${appName} — ${tagline}`)}</row>`,
      `<row r="2" ht="20" customHeight="1">${inlineCell('A2', 3, reportTitle)}</row>`
    )
    if (subtitle) brandRows.push(`<row r="3" ht="18" customHeight="1">${inlineCell('A3', 4, subtitle)}</row>`)
  }

  /* ── Meta band (row 5, full width) ── */
  brandRows.push(`<row r="5" ht="22" customHeight="1">${inlineCell('A5', 5, metaText)}</row>`)
  if (colCount > 1 || !hasLogo) brandMerges.push(`<mergeCell ref="A5:${lastLetter}5"/>`)

  /* ── Executive summary row (above the table, full width) ── */
  if (hasSummary) {
    brandRows.push(`<row r="${headerRow}" ht="22" customHeight="1">${inlineCell('A' + headerRow, 5, summaryText)}</row>`)
    if (colCount > 1 || !hasLogo) brandMerges.push(`<mergeCell ref="A${headerRow}:${lastLetter}${headerRow}"/>`)
  }

  /* ── Header row ── */
  const headerCells = headers
    .map((h, i) => inlineCell(`${columnLetter(i + 1)}${headerRow}`, alignStyles[alignments[i]] || 9, h))
    .join('')
  brandRows.push(`<row r="${headerRow}" ht="24" customHeight="1">${headerCells}</row>`)

  /* ── Data rows ── */
  const dataRows = rows
    .map((row, ri) => {
      const zebra = ri % 2 === 1
      const cells = row
        .map((v, c) => {
          const base = alignStyles[alignments[c]]
          const style = base === undefined ? (zebra ? 10 : 9) : zebra ? base + 1 : base
          return inlineCell(`${columnLetter(c + 1)}${ri + dataStart}`, style, v)
        })
        .join('')
      return `<row r="${ri + dataStart}">${cells}</row>`
    })
    .join('')

  /* ── Totals row (professional finish) ── */
  let totalsRowXml = ''
  if (totalsRow) {
    // dedicated bold totals styles (16 left / 17 center / 18 right):
    // bold teal type on a teal-tinted fill, thin grid border, never wraps.
    const cells = totalsRow
      .map((v, c) => {
        const alignIdx = alignments[c] === 'center' ? 1 : alignments[c] === 'right' ? 2 : 0
        return inlineCell(`${columnLetter(c + 1)}${totalsIdx}`, 16 + alignIdx, v)
      })
      .join('')
    totalsRowXml = `<row r="${totalsIdx}" ht="20" customHeight="1">${cells}</row>`
  }

  let footerRow = ''
  const merges = [...brandMerges]
  if (footNote) {
    const fr = footIdx
    footerRow = `<row r="${fr}" ht="20" customHeight="1">${inlineCell('A' + fr, 15, footNote)}</row>`
    if (colCount > 1 || !hasLogo) merges.push(`<mergeCell ref="A${fr}:${lastLetter}${fr}"/>`)
  }
  const mergeXml = merges.length ? `<mergeCells count="${merges.length}">${merges.join('')}</mergeCells>` : ''

  const colWidths = []
  if (hasLogo) colWidths.push(`<col min="1" max="1" width="16" customWidth="1"/>`)
  headers.forEach((h, c) => {
    // Longest content in the column — including the TOTAL row so big currency
    // totals (e.g. "RWF 827,870,000") get enough room to stay on ONE line.
    const dataLen = rows.reduce((m, r) => Math.max(m, String(r[c] ?? '').length), 0)
    const totalsLen = totalsRow ? String(totalsRow[c] ?? '').length : 0
    const longest = Math.max(String(h).length, dataLen, totalsLen)
    // Segoe UI is wider than Excel's default font — scale up to prevent the
    // TOTAL currency from wrapping mid-cell.
    const w = Math.min(46, Math.max(15, Math.ceil(longest * 1.3) + 2))
    colWidths.push(`<col min="${c + 1 + (hasLogo ? 1 : 0)}" max="${c + 1 + (hasLogo ? 1 : 0)}" width="${w}" customWidth="1"/>`)
  })

  const sheetXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<dimension ref="A1:${lastLetter}${lastRowIdx}"/>` +
    `<sheetViews><sheetView tabSelected="1" workbookViewId="0"><pane ySplit="${headerRow}" topLeftCell="A${dataStart}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `<sheetFormatPr defaultRowHeight="20"/>` +
    `<cols>${colWidths.join('')}</cols>` +
    `<sheetData>${brandRows.join('')}${dataRows}${totalsRowXml}${footerRow}</sheetData>` +
    mergeXml +
    (hasLogo ? `<drawing r:id="rId1"/>` : '') +
    `</worksheet>`

  /* ── Peripheral XML parts ── */
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    (hasLogo ? `<Default Extension="png" ContentType="image/png"/>` : '') +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
    (hasLogo ? `<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>` : '') +
    `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>` +
    `<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>` +
    `</Types>`

  const relsRoot = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>` +
    `</Relationships>`

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheets><sheet name="${esc(String(reportTitle).slice(0, 31) || 'Report')}" sheetId="1" r:id="rId1"/></sheets>` +
    `</workbook>`

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    `</Relationships>`

  const sheetRels = hasLogo
    ? `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>` +
      `</Relationships>`
    : null

  const drawingXml = hasLogo
    ? `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">` +
      `<xdr:oneCellAnchor editAs="oneCell">` +
      `<xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>` +
      `<xdr:ext cx="571500" cy="571500"/>` +
      `<xdr:pic>` +
      `<xdr:nvPicPr><xdr:cNvPr id="1" name="Logo"/><xdr:cNvPicPr/></xdr:nvPicPr>` +
      `<xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>` +
      `<xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="571500" cy="571500"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr>` +
      `</xdr:pic>` +
      `<xdr:clientData/>` +
      `</xdr:oneCellAnchor>` +
      `</xdr:wsDr>`
    : null

  const drawingRels = hasLogo
    ? `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/>` +
      `</Relationships>`
    : null

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<fonts count="9">` +
    `<font><sz val="10"/><name val="Segoe UI"/></font>` +
    `<font><b/><sz val="17"/><color rgb="${theme.heading}"/><name val="Segoe UI"/></font>` +
    `<font><b/><sz val="8.5"/><color rgb="FF6B7280"/><name val="Segoe UI"/></font>` +
    `<font><b/><sz val="14"/><color rgb="FF0A0A0A"/><name val="Segoe UI"/></font>` +
    `<font><i/><sz val="9"/><color rgb="FF6B7280"/><name val="Segoe UI"/></font>` +
    `<font><b/><sz val="9"/><color rgb="${theme.meta}"/><name val="Segoe UI"/></font>` +
    `<font><b/><sz val="10"/><color rgb="${theme.headerFont}"/><name val="Segoe UI"/></font>` +
    `<font><sz val="10"/><color rgb="FF0A0A0A"/><name val="Segoe UI"/></font>` +
    `<font><i/><sz val="8.5"/><color rgb="FF6B7280"/><name val="Segoe UI"/></font>` +
    `</fonts>` +
    `<fills count="5">` +
    `<fill><patternFill patternType="none"/></fill>` +
    `<fill><patternFill patternType="gray125"/></fill>` +
    `<fill><patternFill patternType="solid"><fgColor rgb="${theme.tint}"/><bgColor indexed="64"/></patternFill></fill>` +
    `<fill><patternFill patternType="solid"><fgColor rgb="${theme.band}"/><bgColor indexed="64"/></patternFill></fill>` +
    `<fill><patternFill patternType="solid"><fgColor rgb="${theme.zebra}"/><bgColor indexed="64"/></patternFill></fill>` +
    `</fills>` +
    `<borders count="2">` +
    `<border><left/><right/><top/><bottom/><diagonal/></border>` +
    `<border><left style="thin"><color rgb="FFE2E8F0"/></left><right style="thin"><color rgb="FFE2E8F0"/></right><top style="thin"><color rgb="FFE2E8F0"/></top><bottom style="thin"><color rgb="FFE2E8F0"/></bottom><diagonal/></border>` +
    `</borders>` +
    `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
    `<cellXfs count="19">` +
    `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
    `<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center" horizontal="left"/></xf>` +
    `<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center" horizontal="left"/></xf>` +
    `<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center" horizontal="left"/></xf>` +
    `<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center" horizontal="left"/></xf>` +
    `<xf numFmtId="0" fontId="5" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" horizontal="left"/></xf>` +
    `<xf numFmtId="0" fontId="6" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="left" wrapText="1"/></xf>` +
    `<xf numFmtId="0" fontId="6" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center" wrapText="1"/></xf>` +
    `<xf numFmtId="0" fontId="6" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="right" wrapText="1"/></xf>` +
    `<xf numFmtId="0" fontId="7" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="left" wrapText="1"/></xf>` +
    `<xf numFmtId="0" fontId="7" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="left" wrapText="1"/></xf>` +
    `<xf numFmtId="0" fontId="7" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center" wrapText="1"/></xf>` +
    `<xf numFmtId="0" fontId="7" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center" wrapText="1"/></xf>` +
    `<xf numFmtId="0" fontId="7" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="right" wrapText="1"/></xf>` +
    `<xf numFmtId="0" fontId="7" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="right" wrapText="1"/></xf>` +
    `<xf numFmtId="0" fontId="8" fillId="4" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" horizontal="left"/></xf>` +
    `<xf numFmtId="0" fontId="5" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="left"/></xf>` +
    `<xf numFmtId="0" fontId="5" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>` +
    `<xf numFmtId="0" fontId="5" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="right"/></xf>` +
    `</cellXfs>` +
    `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
    `</styleSheet>`

  const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
    `<dc:creator>${esc(appName)}</dc:creator>` +
    `<cp:lastModifiedBy>${esc(appName)}</cp:lastModifiedBy>` +
    `<dcterms:created xsi:type="dcterms:W3CDTF">2026-01-01T00:00:00Z</dcterms:created>` +
    `<dcterms:modified xsi:type="dcterms:W3CDTF">2026-01-01T00:00:00Z</dcterms:modified>` +
    `</cp:coreProperties>`

  const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">` +
    `<Application>${esc(appName)}</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop>` +
    `<HeadingPairs/><TitlesOfParts/>` +
    `</Properties>`

  /* ── Assemble ZIP (STORED entries) ── */
  const parts = []
  const central = []
  let offset = 0

  const addFile = (name, data) => {
    const nameB = encode(name)
    const crc = crc32(data)
    const extra = new Uint8Array(0)
    const local = concatParts([
      little(0x04034b50),
      little2(20),
      little2(0),
      little2(0),
      little2(0),
      little2(0x21),
      little(crc),
      little(data.length),
      little(data.length),
      little2(nameB.length),
      little2(extra.length),
      nameB,
      extra,
    ])
    parts.push(local, data)
    central.push({ nameB, crc, size: data.length, offset })
    offset += local.length + data.length
  }

  addFile('[Content_Types].xml', encode(contentTypes))
  addFile('_rels/.rels', encode(relsRoot))
  addFile('docProps/core.xml', encode(coreXml))
  addFile('docProps/app.xml', encode(appXml))
  addFile('xl/workbook.xml', encode(workbookXml))
  addFile('xl/_rels/workbook.xml.rels', encode(workbookRels))
  if (hasLogo && drawingXml) addFile('xl/drawings/drawing1.xml', encode(drawingXml))
  if (hasLogo && drawingRels) addFile('xl/drawings/_rels/drawing1.xml.rels', encode(drawingRels))
  if (hasLogo) addFile('xl/media/image1.png', logoBytes)
  addFile('xl/worksheets/sheet1.xml', encode(sheetXml))
  if (hasLogo && sheetRels) addFile('xl/worksheets/_rels/sheet1.xml.rels', encode(sheetRels))
  addFile('xl/styles.xml', encode(stylesXml))

  const centralStart = offset
  const centralParts = [new Uint8Array(0)]
  central.forEach(({ nameB, crc, size, offset: o }) => {
    centralParts.push(
      concatParts([
        little(0x02014b50),
        little2(20),
        little2(20),
        little2(0),
        little2(0),
        little2(0),
        little2(0x21),
        little(crc),
        little(size),
        little(size),
        little2(nameB.length),
        little2(0),
        little2(0),
        little2(0),
        little2(0),
        little(0),
        little(o),
        nameB,
      ])
    )
  })
  const centralDir = concatParts(centralParts)
  const cdSize = centralDir.length
  const eocd = concatParts([
    little(0x06054b50),
    little2(0),
    little2(0),
    little2(central.length),
    little2(central.length),
    little(cdSize),
    little(centralStart),
    little2(0),
  ])

  return concatParts([...parts, centralDir, eocd])
}

export default buildXlsx