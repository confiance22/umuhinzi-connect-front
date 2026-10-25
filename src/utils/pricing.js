/**
 * pricing.js — carton vs loose-unit value helpers.
 *
 * A product carries two prices:
 *   price     → RWF per carton (e.g. 600,000 for 20 pairs of Airforce)
 *   unitPrice → RWF per single loose unit (e.g. 40,000 per pair)
 *
 * When unitPrice is not set we fall back to price ÷ piecesPerCarton so older
 * products still value loose pieces sensibly.
 */
export const unitPriceOf = (product) => {
  if (product?.unitPrice != null && product.unitPrice !== '') return Number(product.unitPrice)
  const cartonPrice = Number(product?.price) || 0
  const ppc = Number(product?.piecesPerCarton) || 1
  return Math.round(cartonPrice / Math.max(1, ppc))
}

/**
 * Value of a movement expressed in cartons + loose pieces:
 *   cartons × carton price  +  loose pieces × unit price
 */
export const valueOfMovement = ({ price = 0, unitPrice, piecesPerCarton = 1, cartons = 0, pieces = 0 }) => {
  const cartonPrice = Number(price) || 0
  const loose = Number(pieces) || 0
  const cartonsCount = Number(cartons) || 0
  if (cartonsCount === 0 && loose === 0) return 0
  const each = unitPrice != null && unitPrice !== '' ? Number(unitPrice) : Math.round(cartonPrice / Math.max(1, Number(piecesPerCarton) || 1))
  return cartonsCount * cartonPrice + loose * each
}