/**
 * QRScanPage — camera scanning page.
 * Scans a product QR to look it up: shows product info, current stock, and
 * quick actions (record stock in/out, add to current stock check).
 * Reuses useQRScanner + utils/qrCodeHelpers.parseQrPayload.
 */
export default function QRScanPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Scan QR</h1>
      {/* TODO: <QRCodeScanner /> → parse payload → qrApi.resolveScannedCode → product card/actions */}
    </div>
  )
}