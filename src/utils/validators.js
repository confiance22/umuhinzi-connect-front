/**
 * validators.js — client-side validation + light sanitization for ALL forms
 * BEFORE data is sent to the API (defense in depth; backend validates too).
 *
 * Planned helpers (return `{ valid: boolean, error?: string }` or boolean per
 * convention chosen here):
 *   required(value)               — non-empty
 *   isEmail(value)                — basic email shape
 *   isPhoneRw(value)              — Rwandan numbers (+250/07xxxxxxxx)
 *   isPositiveNumber(value)       — >= 0 numeric
 *   maxLength(value, n), minLength, pattern(regex, value)
 *
 * Also sanitize: trim whitespace, strip control chars / early strings that
 * could be mistaken for HTML (XSS-safe input) before transmission.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_RW_RE = /^(\+250|0)?7[2389]\d{7}$/

// TODO(implementation) — stubs below keep call-sites compiling.
export function required() {
  return false
}
export function isEmail() {
  return false
}
export function isPhoneRw() {
  return false
}
export function isPositiveNumber() {
  return false
}
export function sanitizeInput(value) {
  return value // TODO: trim + strip dangerous chars
}