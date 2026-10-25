/**
 * branding.js — shared brand identity helpers for professional exports
 * (PDF + Excel). Resolves the app logo once and formats report headers so
 * every generated file carries the shop name, tagline and StockRwa brand.
 */
import logoUrl from '../assets/pdf-logo/report-export-logo.png'

export const APP_NAME = 'StockRwa'
export const APP_TAGLINE = 'Inventory Control & Audit System'
export const BRAND_PRIMARY = '#0b5f32' // brand-700 green
export const BRAND_DARK = '#0d0d0d'
export const BRAND_LIGHT = '#d7f5e3'

let cachedLogo = null

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

const fromDataUrl = (dataUrl) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('decode failed'))
    img.src = dataUrl
  })

/**
 * Resolve the brand logo to an inline base64 PNG data URL.
 * Never returns a plain URL — exporters can always embed the image.
 * Returns { dataUrl: null, width: 0, height: 0 } if it cannot be loaded.
 */
export const getLogo = async () => {
  if (cachedLogo) return cachedLogo
  try {
    const img = new Image()
    img.src = logoUrl
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth || 96
    canvas.height = img.naturalHeight || 96
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    cachedLogo = { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height }
    return cachedLogo
  } catch {
    try {
      const res = await fetch(logoUrl)
      const blob = await res.blob()
      const dataUrl = await blobToDataUrl(blob)
      cachedLogo = await fromDataUrl(dataUrl)
      return cachedLogo
    } catch {
      cachedLogo = { dataUrl: null, width: 0, height: 0 }
      return cachedLogo
    }
  }
}

export const shopDisplayName = (user) => user?.shopName || user?.shop?.name || 'My Shop'

export const formatDateTime = (date = new Date()) =>
  new Date(date).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })

export const formatDateShort = (date = new Date()) =>
  new Date(date).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' })

export const toIsoDay = (date = new Date()) => {
  const d = new Date(date)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}