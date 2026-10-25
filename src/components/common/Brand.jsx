/**
 * Brand — Umuhinzi Connect brand lockup using the shared logo mark.
 * dark=true renders the dark mark for light/solid backgrounds.
 */
import logo from '../../assets/logo/umuhinzi-logo.svg'

export const BrandMark = ({ size = 34, className = '', dark = false }) => (
  <img
    src={logo}
    alt="Umuhinzi Connect logo"
    className={`shrink-0 object-contain ${dark ? '' : 'brightness-0 invert'} ${className}`}
    style={{ width: size, height: size }}
  />
)

export const BrandLockup = ({
  dark = false,
  hideText = false,
  size = 34,
  textClassName = 'text-base'
}) => (
  <div className="flex items-center gap-2">
    <BrandMark size={size} dark={dark} />
    {!hideText && (
      <span
        className={`font-semibold tracking-tight whitespace-nowrap ${textClassName} ${
          dark ? 'text-ink' : 'text-white'
        }`}
      >
        Umuhinzi <span className={dark ? 'text-brand-700' : 'text-brand-300'}>Connect</span>
      </span>
    )}
  </div>
)

export default BrandLockup
