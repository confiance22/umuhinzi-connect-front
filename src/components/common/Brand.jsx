/**
 * Brand — Umuhinzi Connect brand lockup using the shared logo mark.
 */
import logo from '../../assets/logo/umuhinzi-connect-logo.svg'
import { BRAND_FIRST, BRAND_NAME, BRAND_SECOND } from '../../constants/brand'

export const BrandMark = ({ size = 34, className = '' }) => (
  <img
    src={logo}
    alt={`${BRAND_NAME} logo`}
    className={`shrink-0 object-contain ${className}`}
    style={{ width: size, height: size }}
  />
)

export const BrandLockup = ({
  dark = false,
  hideText = false,
  bold = false,
  size = 34,
  textClassName = 'text-base'
}) => (
  <div className="flex items-center gap-2">
    <BrandMark size={size} />
    {!hideText && (
      <span
        className={`${bold ? 'font-bold' : 'font-semibold'} tracking-tight whitespace-nowrap ${textClassName} ${
          dark ? 'text-ink' : 'text-white'
        }`}
      >
        {BRAND_FIRST} <span className={dark ? 'text-brand-700' : 'text-brand-300'}>{BRAND_SECOND}</span>
      </span>
    )}
  </div>
)

export default BrandLockup
