/**
 * Badge — small status/role pill (e.g. low stock, roles, QR/audit states).
 * Uses children text and a tone prop (gray | green | red | brand | amber).
 */
export default function Badge({ tone = 'gray', children, className = '' }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-800',
    brand: 'bg-brand-50 text-brand-700',
  }
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}>{children}</span>
}