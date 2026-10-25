/**
 * qrCodeHelpers.js — the ONLY place that builds and parses product QR payloads,
 * so the generate page and scan page always agree on the format.
 *
 * Versioned payload (JSON inside the QR string) for backward compatibility:
 *   { "v": 1, "type": "product", "id": "<id>", "code": "<sku>", "name": "..." }
 *
 * parseQrPayload must never throw on garbage — scanning input is untrusted, so
 * any non-JSON text is treated as a plain code (the SKU printed under the QR).
 */
export function buildProductQrPayload(product) {
  if (!product) return null
  return JSON.stringify({
    v: 1,
    type: 'product',
    id: String(product?.id ?? ''),
    code: product?.sku || product?.code || '',
    name: product?.name || '',
  })
}

export function parseQrPayload(rawString) {
  const raw = String(rawString || '').trim()
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.v === 1 && parsed.code) {
      return { code: String(parsed.code), id: parsed.id ? String(parsed.id) : undefined, name: parsed.name }
    }
  } catch {
    /* not JSON → treated as a plain code below */
  }
  return { code: raw }
}