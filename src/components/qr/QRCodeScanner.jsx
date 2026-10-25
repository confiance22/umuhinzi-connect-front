/**
 * QRCodeScanner — camera scanner component built on hooks/useQRScanner.
 * Streams decoded payloads to onScan; used on the QR scan page and inside the
 * stock-check/audit flow. Payload parsing lives in utils/qrCodeHelpers.js.
 */
import { useQRScanner } from '../../hooks/useQRScanner'

export default function QRCodeScanner({ onScan, elementId = 'qr-reader' }) {
  const { isScanning, error, startScan, stopScan } = useQRScanner(onScan)

  // TODO(implementation): render <video id={elementId}/> + start/stop controls.
  return (
    <div className="rounded-2xl border border-line bg-card shadow-soft p-4">
      <div id={elementId} className="mx-auto max-w-sm" />
      <div className="mt-3 flex justify-center gap-3">
        <button
          onClick={isScanning ? stopScan : startScan}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
        >
          {isScanning ? 'Stop camera' : 'Start scanning'}
        </button>
      </div>
      {error && <p className="mt-2 text-center text-sm text-danger-600">{error}</p>}
    </div>
  )
}