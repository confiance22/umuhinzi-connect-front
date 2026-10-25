/**
 * QRCodeGenerator — renders a QR code canvas for a product.
 * Uses qrcode.react (QRCodeCanvas). Supports forwardedRef to allow
 * the parent to access the canvas element for PNG download.
 */
import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { buildProductQrPayload } from '../../utils/qrCodeHelpers'

/* Export resolution — canvas renders at high pixel size so downloads
   /prints stay sharp when zoomed; size prop only controls display. */
const EXPORT_QR_SIZE = 1024

export default function QRCodeGenerator({ product, size = 160, includeMargin = true, level = 'H', forwardedRef }) {
  const internalRef = useRef(null)
  const canvasRef = forwardedRef || internalRef

  const value = product
    ? (buildProductQrPayload(product) ?? product.sku ?? product.name ?? 'N/A')
    : 'N/A'

  return (
    <div className="flex items-center justify-center">
      <QRCodeCanvas
        ref={canvasRef}
        value={value}
        size={EXPORT_QR_SIZE}
        level={level}
        includeMargin={includeMargin}
        bgColor="#ffffff"
        fgColor="#0A0A0A"
        style={{ width: size, height: size }}
      />
    </div>
  )
}