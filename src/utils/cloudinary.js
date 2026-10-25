/**
 * cloudinary.js — unsigned Cloudinary upload helpers for product photos.
 * Preset "stockrwa" targets the "stockrwa" folder on the pgzjigta account.
 * Values come from Vite env vars (VITE_CLOUDINARY_*) with the account
 * defaults as fallback so local dev works out of the box.
 */
const env = (import.meta?.env) || {}

export const CLOUDINARY = {
  cloudName: env.VITE_CLOUDINARY_CLOUD_NAME || 'pgzjigta',
  uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET || 'stockrwa',
  uploadUrl:
    env.VITE_CLOUDINARY_UPLOAD_URL ||
    'https://api.cloudinary.com/v1_1/pgzjigta/auto/upload',
}

export async function uploadProductPhoto(file) {
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', CLOUDINARY.uploadPreset)
  const response = await fetch(CLOUDINARY.uploadUrl, { method: 'POST', body: form })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body?.error?.message || 'Photo upload failed - try again.')
  }
  const data = await response.json()
  return data?.secure_url || null
}