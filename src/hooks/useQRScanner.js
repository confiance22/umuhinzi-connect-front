/**
 * useQRScanner.js — real camera QR scanning via html5-qrcode.
 * Manages the camera lifecycle (start/stop/cleanup) and streams decoded
 * payloads to onScan. Unmount-safe: the camera is always released when the
 * hook unmounts so the phone's torch/camera quits cleanly.
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export function useQRScanner(onScan) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  const stopScan = useCallback(async () => {
    const scanner = scannerRef.current
    scannerRef.current = null
    if (!scanner) {
      setIsScanning(false)
      return
    }
    try {
      if (scanner.isScanning) await scanner.stop()
      await scanner.clear()
    } catch {
      /* camera already released */
    }
    setIsScanning(false)
  }, [])

  const startScan = useCallback(async (elementId = 'qr-reader') => {
    if (scannerRef.current) return
    setError(null)
    try {
      const element = document.getElementById(elementId)
      if (!element) throw new Error('Scanner container not ready')
      const scanner = new Html5Qrcode(elementId)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => onScanRef.current?.(decodedText),
        () => {
          /* ignore per-frame decode misses */
        },
      )
      setIsScanning(true)
    } catch (err) {
      scannerRef.current = null
      setError(err?.message || 'Could not open the camera')
      setIsScanning(false)
    }
  }, [])

  useEffect(() => () => {
    stopScan()
  }, [stopScan])

  return { isScanning, error, startScan, stopScan }
}

export default useQRScanner