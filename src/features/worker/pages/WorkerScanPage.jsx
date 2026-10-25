/**
 * WorkerScanPage — the ONLY screen a worker really needs: point the camera
 * (or type the code under the QR), pick how many, take it out. Big buttons,
 * plain words, one action at a time. Every take-out is logged to the worker
 * and the shop manager gets a live notification.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { qrApi } from '../../../api/qrApi'
import { stockApi } from '../../../api/stockApi'
import { productApi } from '../../../api/productApi'
import { useAuth } from '../../../hooks/useAuth'
import { useToastContext } from '../../../context/ToastContext'
import { parseQrPayload } from '../../../utils/qrCodeHelpers'
import useQRScanner from '../../../hooks/useQRScanner'
import { formatCurrency } from '../../../utils/formatCurrency'
import { valueOfMovement } from '../../../utils/pricing'
import CustomerPicker from '../../../components/stock/CustomerPicker'

const currency = (n) => formatCurrency(n)

const OutIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v10m0 0-3.5-3.5M12 13l3.5-3.5" />
    <path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
  </svg>
)

const InIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 13V3m0 0 3.5 3.5M12 3 8.5 6.5" />
    <path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
  </svg>
)

const ModeSwitcher = ({ mode, onChange }) => (
  <div className="grid grid-cols-2 gap-1.5 rounded-full border border-ink/[0.05] bg-ink/[0.06] p-1.5 mb-5 shadow-[inset_0_1px_2px_rgba(13,13,13,0.04)]">
    {[
      { key: 'out', label: 'Take Out', icon: OutIcon },
      { key: 'in', label: 'Receive Stock', icon: InIcon },
    ].map((t) => {
      const Icon = t.icon
      const active = mode === t.key
      return (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-bold transition-all duration-200 ${
            active
              ? 'bg-white text-brand-700 shadow-[0_2px_10px_rgba(13,13,13,0.12)]'
              : 'text-gray-500 hover:text-ink'
          }`}
        >
          <Icon className={active ? 'w-4 h-4' : 'w-4 h-4 text-gray-400'} />
          {t.label}
        </button>
      )
    })}
  </div>
)

const cardShell = 'rounded-3xl border border-ink/[0.06] bg-card shadow-[0_1px_0_rgba(16,134,60,0.05),0_18px_44px_-28px_rgba(13,13,13,0.28)]'
const microLabel = 'text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600'
const inputShell =
  'w-full rounded-xl border border-line bg-white px-4 py-4 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors'
const primaryBtn =
  'w-full py-5 rounded-full bg-gradient-to-t from-brand-800 to-brand-600 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-[0_14px_34px_-14px_rgba(16,134,60,0.75),inset_0_1px_0_rgba(255,255,255,0.22)] transition-[transform,filter] duration-150 hover:brightness-105 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none'

export default function WorkerScanPage() {
  const { user } = useAuth()
  const { showToast } = useToastContext()

  const [mode, setMode] = useState('out')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [lookedUp, setLookedUp] = useState(false)
  const [product, setProduct] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [cartons, setCartons] = useState(0)
  const [pieces, setPieces] = useState(0)
  const [note, setNote] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)

  const [receiveQuery, setReceiveQuery] = useState('')
  const [receiveResults, setReceiveResults] = useState([])
  const [receiveSearching, setReceiveSearching] = useState(false)
  const [receivePicked, setReceivePicked] = useState(false)

  const [outQuery, setOutQuery] = useState('')
  const [outResults, setOutResults] = useState([])
  const [outSearching, setOutSearching] = useState(false)

  const [dest, setDest] = useState('customer')
  const [activeImg, setActiveImg] = useState(0)

  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)

  /* Coming from Shop Chat with a shared product ("Remove from stock")? Preselect it. */
  const [searchParams, setSearchParams] = useSearchParams()
  const prefilledId = searchParams.get('productId')
  const didPrefill = useRef(false)
  useEffect(() => {
    if (!prefilledId || didPrefill.current) return
    didPrefill.current = true
    ;(async () => {
      try {
        const p = await productApi.get(prefilledId)
        if (p?.id && p?.shopId === user?.shopId) {
          setMode('out')
          setProduct(p)
          setLookedUp(true)
          setCartons(0)
          setPieces(0)
        }
      } catch {
        /* ignore — the plain scan screen keeps working */
      } finally {
        setSearchParams({}, { replace: true })
      }
    })()
  }, [prefilledId, user?.shopId, setSearchParams])

  /* Every photo attached to the product — fall back to the single cover photo. */
  const productImages =
    (product?.photos?.length ? product.photos : product?.photo ? [product.photo] : [])
      .filter(Boolean)

  useEffect(() => {
    setActiveImg(0)
  }, [product?.id])

  const handlingDecodeRef = useRef(false)
  const codeInputRef = useRef(null)

  const canReceive = Boolean(user?.stockInEnabled)

  useEffect(() => {
    if (mode !== 'in' || receivePicked) return
    const q = receiveQuery.trim()
    if (q.length < 2) { setReceiveResults([]); return }
    const t = setTimeout(async () => {
      setReceiveSearching(true)
      try {
        const found = await productApi.search(q)
        setReceiveResults(Array.isArray(found) ? found : [])
      } catch {
        setReceiveResults([])
      } finally {
        setReceiveSearching(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [receiveQuery, mode, receivePicked])

  useEffect(() => {
    if (mode !== 'out') return
    const q = outQuery.trim()
    if (q.length < 2) { setOutResults([]); return }
    const t = setTimeout(async () => {
      setOutSearching(true)
      try {
        const found = await productApi.search(q)
        setOutResults(Array.isArray(found) ? found : [])
      } catch {
        setOutResults([])
      } finally {
        setOutSearching(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [outQuery, mode])

  const resolveCode = async (raw) => {
    const value = String(raw || '').trim()
    if (!value) return
    setSearching(true)
    setLookedUp(false)
    setProduct(null)
    setCustomer(null)
    setDone(null)
    try {
      const found = await qrApi.resolveScannedCode(value)
      setLookedUp(true)
      if (found) {
        setProduct(found)
        setCartons(0)
        setPieces(0)
      } else {
        showToast(`No product with the code "${value}"`, 'error')
      }
    } finally {
      setSearching(false)
    }
  }

  /* Decoder wired to the camera — closes the overlay, stops the lens, resolves. */
  const stopScanRef = useRef(null)
  const decodeRef = useRef(async () => {})
  decodeRef.current = async (text) => {
    if (handlingDecodeRef.current) return
    handlingDecodeRef.current = true
    setCameraOpen(false)
    try {
      if (stopScanRef.current) await stopScanRef.current()
      const parsed = parseQrPayload(text)
      await resolveCode(parsed?.code || text)
    } finally {
      handlingDecodeRef.current = false
    }
  }
  const onDecode = useCallback((text) => decodeRef.current(text), [])
  const { isScanning, error: scanError, startScan, stopScan } = useQRScanner(onDecode)
  stopScanRef.current = stopScan

  useEffect(() => {
    if (!cameraOpen) return
    const t = setTimeout(() => startScan('worker-qr-reader'), 120)
    return () => clearTimeout(t)
  }, [cameraOpen, startScan])

  const openCamera = () => {
    setCameraOpen(true)
    setCode('')
  }

  const switchMode = (next) => {
    if (next === mode) return
    setMode(next)
    setDone(null)
    setProduct(null)
    setCustomer(null)
    setLookedUp(false)
    setReceivePicked(false)
    setReceiveQuery('')
    setReceiveResults([])
    setCartons(0)
    setPieces(0)
    setNote('')
    setCode('')
    setDest('customer')
    setActiveImg(0)
    setCart([])
    setCartOpen(false)
  }

  const pickReceiveProduct = (p) => {
    setProduct(p)
    setLookedUp(true)
    setReceivePicked(true)
    setReceiveQuery('')
    setReceiveResults([])
    setCartons(0)
    setPieces(0)
    setNote('')
  }

  const pickOutProduct = (p) => {
    setProduct(p)
    setLookedUp(true)
    setCode('')
    setOutQuery('')
    setOutResults([])
    setCartons(0)
    setPieces(0)
    setNote('')
    setDest('customer')
    setActiveImg(0)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  /* Add the current product to the multi-item cart, then go back to scanning. */
  const addToCart = () => {
    if (!product) return
    const total = totalPieces
    if (!total || total <= 0) {
      showToast('Enter how many you are taking out first', 'error')
      return
    }
    if (looseOverLimit) {
      showToast(`Loose ${product.unit || 'pcs'} can't exceed ${looseLimit} per carton — count a full carton instead`, 'error')
      return
    }
    setCart((prev) => [
      ...prev,
      {
        key: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        product,
        cartons: decompose.cartons,
        pieces: decompose.pieces,
        qty: total,
      },
    ])
    const alreadyIn = cart.some((it) => it.product.id === product.id)
    showToast(
      alreadyIn
        ? `Added ${product.name} again (now ${cart.length + 1} lines) — scan the next one`
        : `Added ${product.name} — scan the next one`,
      'success',
    )
    setProduct(null)
    setLookedUp(false)
    setCartons(0)
    setPieces(0)
    setCode('')
    setNote('')
    setActiveImg(0)
    setTimeout(() => codeInputRef.current?.focus(), 60)
  }

  const removeFromCart = (key) => setCart((prev) => prev.filter((it) => it.key !== key))

  const submitCart = async () => {
    if (!cart.length) return
    if (dest !== 'shop' && !customer) {
      showToast('Choose who is taking it: pick a customer, or select "Our shop".', 'error')
      return
    }
    setSubmitting(true)
    try {
      await stockApi.recordStockOutBatch({
        items: cart.map((it) => ({ productId: it.product.id, cartons: it.cartons, pieces: it.pieces, qty: it.qty })),
        reason: note.trim() || (dest === 'shop' ? 'Took out for our shop' : 'Worker cart taken out'),
        ...(dest === 'shop'
          ? { toShop: true }
          : { customerId: customer.id, customerName: customer.name, customerPhone: customer.phone || undefined }),
      })
      setDone({
        kind: 'out-batch',
        qty: cart.reduce((s, it) => s + it.qty, 0),
        count: cart.length,
        items: cart.map((it) => it.product.name),
      })
      setCart([])
      setCartOpen(false)
      showToast(`Took out ${cart.length} product${cart.length > 1 ? 's' : ''}`, 'success')
    } catch (err) {
      showToast(err.message || 'Could not record the take-out', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const submitReceive = async (e) => {
    if (e) e.preventDefault()
    if (!product) return
    const total = totalPieces
    if (!total || total <= 0) {
      showToast('Enter how many pieces you are receiving first.', 'error')
      return
    }
    if (looseOverLimit) {
      showToast(`Loose ${product.unit || 'pcs'} can't exceed ${looseLimit} per carton — count a full carton instead`, 'error')
      return
    }
    setSubmitting(true)
    try {
      await stockApi.recordStockIn({
        shopId: user?.shopId || 1,
        productId: product.id,
        productName: product.name,
        qty: total,
        cartons: decompose.cartons,
        pieces: decompose.pieces,
        reason: note.trim() || 'Worker received stock',
        actorId: user?.id,
        actorName: user?.name || user?.username,
      })
      setDone({ kind: 'in', qty: total, cartons: decompose.cartons, pieces: decompose.pieces, name: product.name })
      showToast(`Received ${total} × ${product.name}`, 'success')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message
      showToast(msg || 'Could not record the receive', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const closeCamera = async () => {
    setCameraOpen(false)
    if (stopScanRef.current) await stopScanRef.current()
  }

  const submitTakeOut = async (e) => {
    if (e) e.preventDefault()
    if (!product) return
    if (dest !== 'shop' && !customer) {
      showToast('Choose who is taking it: pick a customer, or select "Our shop".', 'error')
      return
    }
    const total = totalPieces
    if (!total || total <= 0) {
      showToast('Enter how many pieces you are taking out first.', 'error')
      return
    }
    if (looseOverLimit) {
      showToast(`Loose ${product.unit || 'pcs'} can't exceed ${looseLimit} per carton — count a full carton instead`, 'error')
      return
    }
    setSubmitting(true)
    try {
      const base = {
        shopId: user?.shopId || 1,
        productId: product.id,
        productName: product.name,
        qty: total,
        cartons: decompose.cartons,
        pieces: decompose.pieces,
        reason: note.trim() || (dest === 'shop' ? 'Took out for our shop' : 'Worker scan & tick taken out'),
        actorId: user?.id,
        actorName: user?.name || user?.username,
      }
      await stockApi.recordStockOut(
        dest === 'shop'
          ? { ...base, toShop: true }
          : {
              ...base,
              customerId: customer.id,
              customerName: customer.name,
              customerPhone: customer.phone || undefined,
            },
      )
      setDone({ qty: total, cartons: decompose.cartons, pieces: decompose.pieces, name: product.name })
      showToast(
        dest === 'shop'
          ? `Took out ${total} × ${product.name} for our shop`
          : `Took out ${total} × ${product.name}`,
        'success',
      )
    } catch (err) {
      showToast(err.message || 'Could not record the take-out', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setProduct(null)
    setCustomer(null)
    setLookedUp(false)
    setCartons(0)
    setPieces(0)
    setNote('')
    setCode('')
    setReceiveQuery('')
    setReceiveResults([])
    setReceivePicked(false)
    setOutQuery('')
    setOutResults([])
    setDest('customer')
    setActiveImg(0)
    setCart([])
    setCartOpen(false)
    setDone(null)
    setTimeout(() => codeInputRef.current?.focus(), 60)
  }

  const ppc = () => Number(product?.piecesPerCarton) || 1
  const looseLimit = ppc() > 1 ? ppc() : null
  const rawCartons = product ? Number(cartons) || 0 : 0
  const rawLoose = product ? Number(pieces) || 0 : 0
  const fullCartons = Math.floor(rawCartons)
  const partialPieces = Math.round((rawCartons - fullCartons) * ppc())
  const effectiveLoose = partialPieces + rawLoose
  const totalPieces = product ? fullCartons * ppc() + effectiveLoose : 0
  const decompose = { cartons: fullCartons, pieces: effectiveLoose }
  const looseOverLimit = looseLimit != null && effectiveLoose > ppc()

  /* Cartons may be typed (halves allowed, e.g. 3.5) or stepped in whole cartons,
     with a quick ½ button for half a carton. Stock always decomposes to whole units:
     3.5 cartons = 3 cartons + half the pieces of one carton. */
  const incCartons = () => setCartons((c) => (mode === 'out' && totalPieces >= maxQty ? c : Math.floor(c) + 1))
  const decCartons = () => setCartons((c) => Math.max(0, Math.ceil(c) - 1))
  const toggleHalfCarton = () => setCartons((c) => {
    const f = Math.floor(c)
    if (mode === 'out' && totalPieces >= maxQty) return c
    return c !== f ? f : f + 0.5
  })
  const incPieces = () => setPieces((p) => {
    if (mode === 'out' && totalPieces >= maxQty) return p
    if (looseLimit != null && effectiveLoose >= looseLimit) return p
    return p + 1
  })
  const decPieces = () => setPieces((p) => Math.max(0, p - 1))

  const maxQty = Number(product?.quantity || 0)

  const stepBtn = (tone) =>
    `w-12 h-12 rounded-full inline-flex items-center justify-center text-2xl font-semibold transition-[transform,background-color,color] duration-150 active:scale-[0.94] disabled:opacity-60 disabled:pointer-events-none ${
      tone === 'plus'
        ? 'bg-gradient-to-t from-brand-700 to-brand-500 text-white shadow-[0_8px_18px_-8px_rgba(16,134,60,0.65),inset_0_1px_0_rgba(255,255,255,0.25)]'
        : 'bg-white border border-line text-ink shadow-[0_1px_2px_rgba(13,13,13,0.05)] hover:bg-page'
    }`

  /* ── Camera overlay (fullscreen, phone-native) ─────────────────── */
  if (cameraOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
          <div id="worker-qr-reader" className="w-full max-w-[400px]" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 rounded-3xl relative">
              <span className="absolute -top-8 left-0 right-0 text-center text-white/90 text-xs font-semibold">
                Point at the QR code
              </span>
              {[
                'border-t-[4px] border-l-[4px] rounded-tl-2xl top-0 left-0',
                'border-t-[4px] border-r-[4px] rounded-tr-2xl top-0 right-0',
                'border-b-[4px] border-l-[4px] rounded-bl-2xl bottom-0 left-0',
                'border-b-[4px] border-r-[4px] rounded-br-2xl bottom-0 right-0',
              ].map((cls) => (
                <span key={cls} className={`absolute w-7 h-7 border-brand-500 ${cls}`} />
              ))}
            </div>
          </div>
          {!isScanning && !scanError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </div>
          )}
        </div>

        {scanError ? (
          <div className="px-6 pb-10 text-center">
            <p className="text-white/90 text-sm mb-4">{scanError}</p>
            <button
              onClick={() => {
                setCameraOpen(true)
                startScan('worker-qr-reader')
              }}
              className="w-full py-4 rounded-full bg-white text-ink border border-line text-sm font-medium inline-flex items-center justify-center gap-2 transition-[transform,background-color,color] duration-150 hover:bg-page active:scale-[0.98]"
            >
              Try again
            </button>
            <button
              onClick={closeCamera}
              className="mt-3 w-full py-4 rounded-full bg-white/15 text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
            >
              Type the code instead
            </button>
          </div>
        ) : (
          <div className="px-6 pb-12 pt-4 flex items-center justify-between">
            <button
              onClick={closeCamera}
              className="w-20 h-20 rounded-full bg-white/15 text-white text-sm font-medium backdrop-blur transition-[transform,background-color,color] duration-150 active:scale-[0.98] flex flex-col items-center justify-center gap-1"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Close
            </button>
            <button onClick={closeCamera} className="text-white/60 underline text-xs font-semibold">
              Type the code
            </button>
          </div>
        )}
      </div>
    )
  }

  /* ── Success ───────────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center pt-10 text-center animate-[slideUp_0.3s_ease]">
        <span className="relative w-28 h-28 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center mb-6 animate-[popIn_0.5s_ease] shadow-[0_24px_50px_-20px_rgba(16,134,60,0.55)]">
          <span className="absolute inset-1 rounded-full ring-4 ring-white/20" />
          <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-600">Stock updated</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {done.kind === 'in' ? 'Received!' : done.kind === 'out-batch' ? 'All taken out!' : 'Taken out!'}
        </h2>
        {done.kind === 'out-batch' ? (
          <>
            <p className="mt-2 text-sm text-muted">{done.count} product{done.count > 1 ? 's' : ''} · {done.qty} {product?.unit || 'pcs'}</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
              {done.items.map((n, i) => (
                <li key={i} className="rounded-full bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1">
                  {n}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">
              {done.qty} × {done.name}
            </p>
            {Number(done.cartons) > 0 && (
              <p className="mt-0.5 text-xs text-muted">{done.cartons} carton{done.cartons > 1 ? 's' : ''} + {done.pieces} loose</p>
            )}
          </>
        )}
        <p className="mt-1 text-xs text-muted">Saved to {user?.name || user?.username}. Manager notified.</p>
        <button
          onClick={reset}
          className="mt-8 w-full py-5 rounded-full bg-gradient-to-t from-brand-800 to-brand-600 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-[0_14px_34px_-14px_rgba(16,134,60,0.75),inset_0_1px_0_rgba(255,255,255,0.22)] transition-[transform,filter] duration-150 hover:brightness-105 active:scale-[0.98]"
        >
          {done.kind === 'in' ? 'Receive more stock' : 'Scan next product'}
        </button>
      </div>
    )
  }

  /* ── Multi-item cart review (take-out) ─────────────────────────── */
  if (cartOpen && mode === 'out') {
    const cartTotal = cart.reduce((s, it) => s + (it.qty || 0), 0)
    const unverified = cart.some((it) => it.product.status && it.product.status !== 'VERIFIED')
    return (
      <div className="animate-[slideUp_0.25s_ease] space-y-4">
        {canReceive && <ModeSwitcher mode={mode} onChange={switchMode} />}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-ink leading-tight">Taking out list</h2>
            <p className="text-xs text-muted mt-0.5">{cart.length} product{cart.length > 1 ? 's' : ''} · {cartTotal} pcs</p>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="shrink-0 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-full px-3.5 py-2 transition-colors active:scale-[0.98]"
          >
            ← Keep scanning
          </button>
        </div>

        {cart.length === 0 ? (
          <div className={`${cardShell} p-6 text-center`}>
            <p className="text-sm font-semibold text-ink">Nothing in your list yet</p>
            <p className="text-xs text-muted mt-1">Scan or search a product, then tap "Add & scan another".</p>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="mt-4 rounded-full bg-brand-700 text-white text-sm font-bold px-5 py-3 transition-[transform,filter] duration-150 hover:brightness-105 active:scale-[0.97]"
            >
              Back to scanning
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {cart.map((it) => (
              <li key={it.key} className={`${cardShell} p-4 flex items-center gap-3`}>
                <span className="w-11 h-11 rounded-xl bg-page border border-line overflow-hidden flex items-center justify-center shrink-0">
                  {it.product.photo ? (
                    <img src={it.product.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-300">{it.product.name?.charAt(0) || '?'}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink truncate">{it.product.name}</span>
                  <span className="block text-xs text-muted truncate">
                    {it.qty} pcs{it.cartons > 0 ? ` · ${it.cartons} carton${it.cartons > 1 ? 's' : ''} + ${it.pieces} loose` : ''}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFromCart(it.key)}
                  aria-label={`Remove ${it.product.name}`}
                  className="shrink-0 w-9 h-9 rounded-full border border-line bg-white text-muted hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-colors active:scale-[0.95]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {cart.length > 0 && (
          <>
            <div className={`${cardShell} p-5 space-y-3`}>
              <label className="block text-sm font-bold text-ink">Who is this going to?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDest('customer')}
                  className={`rounded-2xl px-4 py-3.5 text-sm font-bold transition-[background-color,border-color,color] duration-150 active:scale-[0.98] ${dest === 'customer' ? 'bg-brand-700 text-white shadow-[0_8px_20px_-10px_rgba(16,134,60,0.7)]' : 'border border-line bg-white text-ink hover:bg-page'}`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setDest('shop')}
                  className={`rounded-2xl px-4 py-3.5 text-sm font-bold transition-[background-color,border-color,color] duration-150 active:scale-[0.98] ${dest === 'shop' ? 'bg-brand-700 text-white shadow-[0_8px_20px_-10px_rgba(16,134,60,0.7)]' : 'border border-line bg-white text-ink hover:bg-page'}`}
                >
                  Our shop
                </button>
              </div>
              {dest === 'customer' ? (
                <>
                  <CustomerPicker value={customer} onChange={setCustomer} compact />
                  <p className="text-xs text-muted">Search a saved customer, add a new one, or tap Walk-in.</p>
                </>
              ) : (
                <div className="flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M14 9h1M14 13h1M10 21v-4h4v4" />
                    </svg>
                  </span>
                  <p className="text-[13px] font-semibold text-brand-800 leading-snug">
                    Stock moves to your own shop — no customer is recorded. Add a reason above to keep your records clear.
                  </p>
                </div>
              )}
            </div>

            <div className={`${cardShell} p-5`}>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason (optional) — e.g. shop use or customer order"
                className="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors"
              />
            </div>

            {unverified && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center font-semibold">
                One of the products isn't verified yet — it must be verified before anything here can be taken out.
              </p>
            )}

            <div className="flex items-center justify-between rounded-2xl bg-ink px-4 py-3.5 shadow-[0_10px_24px_-14px_rgba(13,13,13,0.5)]">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Total out</span>
              <span className="text-lg font-bold text-brand-300 tabular-nums">{cartTotal} pcs</span>
            </div>

            <button
              type="button"
              disabled={submitting || !cart.length || unverified}
              onClick={submitCart}
              className={primaryBtn}
            >
              {submitting ? (
                <span className="w-6 h-6 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <>Take out all {cart.length} product{cart.length > 1 ? 's' : ''}</>
              )}
            </button>
            <p className="text-center text-xs text-muted">Tracks to you · manager sees it instantly</p>
          </>
        )}
      </div>
    )
  }

  /* ── Prompt: pick a product (take-out vs receive) ──────────────── */
  if (!product) {
    return (
      <div className="animate-[slideUp_0.25s_ease]">
        {canReceive && <ModeSwitcher mode={mode} onChange={switchMode} />}

        {mode === 'out' && (
          <>
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-7 text-center shadow-[0_24px_56px_-28px_rgba(16,134,60,0.65)]">
              <span className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-brand-500/25 blur-2xl" />
              <span className="pointer-events-none absolute -bottom-24 -left-16 w-48 h-48 rounded-full bg-brand-400/15 blur-2xl" />
              <span className="pointer-events-none absolute top-4 right-5 w-10 h-10 rounded-2xl border border-white/15 rotate-12" />

              <span className="relative inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/12 backdrop-blur text-white mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                </svg>
              </span>
              <h2 className="relative text-white text-xl font-bold tracking-tight">Take a product out</h2>
              <p className="relative text-brand-100/85 text-sm mt-1.5">
                Scan the QR, type the code under it, or search the product by name.
              </p>
              <button
                type="button"
                onClick={openCamera}
                className="relative mt-7 w-full h-16 rounded-full bg-white text-brand-700 text-base font-bold inline-flex items-center justify-center gap-3 shadow-[0_14px_32px_-14px_rgba(0,0,0,0.5)] transition-[transform,box-shadow] duration-150 active:scale-[0.98] animate-[cameraPulse_2.4s_ease-out_infinite]"
              >
                <span className="w-9 h-9 rounded-full bg-brand-50 inline-flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </span>
                Open camera
              </button>
            </div>

            <div className="flex items-center gap-3 my-6">
              <span className="flex-1 h-px bg-line" />
              <span className="text-xs font-semibold text-muted uppercase tracking-widest">or</span>
              <span className="flex-1 h-px bg-line" />
            </div>

            <div className={`${cardShell} p-5`}>
              <label htmlFor="worker-code" className="block text-sm font-bold text-ink mb-2">
                Code under the QR
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  resolveCode(code)
                }}
                className="flex gap-2"
              >
                <input
                  id="worker-code"
                  ref={codeInputRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SHOE-001"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck="false"
                  className="flex-1 min-w-0 rounded-xl border border-line bg-white px-4 py-4 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors"
                />
                <button
                  type="submit"
                  disabled={searching || !code.trim()}
                  className="shrink-0 px-6 rounded-full bg-ink text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-[0_10px_22px_-10px_rgba(13,13,13,0.6)] transition-[transform,background-color,color] duration-150 active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none"
                >
                  {searching ? '…' : 'Find'}
                </button>
              </form>
              {searching && (
                <p className="mt-3 text-xs text-muted flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-brand-700 border-t-transparent animate-spin" />
                  Looking for the product…
                </p>
              )}
              {lookedUp && !product && !searching && (
                <p className="mt-3 text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center">
                  We couldn't find a product with that code. Check the code and try again.
                </p>
              )}
            </div>

            {/* Can't find the code? Search by name */}
            <div className="flex items-center gap-3 my-6">
              <span className="flex-1 h-px bg-line" />
              <span className="text-xs font-semibold text-muted uppercase tracking-widest">no code?</span>
              <span className="flex-1 h-px bg-line" />
            </div>

            <div className={`${cardShell} p-5`}>
              <label htmlFor="worker-out-search" className="block text-sm font-bold text-ink mb-2">
                Search the product by name
              </label>
              <input
                id="worker-out-search"
                value={outQuery}
                onChange={(e) => setOutQuery(e.target.value)}
                placeholder="Type a name — e.g. Airforce"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck="false"
                className={inputShell}
              />
              {outSearching && (
                <p className="mt-3 text-xs text-muted flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-brand-700 border-t-transparent animate-spin" />
                  Searching…
                </p>
              )}
              {outResults.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {outResults.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => pickOutProduct(p)}
                        className="w-full flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-3 text-left transition-[transform,background-color,color] duration-150 hover:border-brand-300 hover:bg-brand-50 active:scale-[0.99]"
                      >
                        <span className="w-11 h-11 rounded-xl bg-page border border-line overflow-hidden flex items-center justify-center shrink-0">
                          {p.photo ? (
                            <img src={p.photo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-semibold text-gray-300">{p.name?.charAt(0) || '?'}</span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink truncate">{p.name}</span>
                          <span className="block text-xs text-muted truncate">{p.category} · {p.sku}</span>
                        </span>
                        <span className="shrink-0 flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-brand-700 tabular-nums">
                            {p.quantity} on shelf
                          </span>
                          {cart.some((it) => it.product.id === p.id) && (
                            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-100 rounded-full px-2 py-0.5">
                              ✓ in your list
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {outQuery.trim().length >= 2 && !outSearching && outResults.length === 0 && (
                <p className="mt-3 text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center">
                  No product matches — check the name or use the QR code.
                </p>
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-4 rounded-3xl border border-brand-200 bg-brand-50/70 p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand-800">
                    {cart.length} product{cart.length > 1 ? 's' : ''} in your list
                  </p>
                  <p className="text-xs text-brand-700/70 mt-0.5">
                    {cart.reduce((s, it) => s + it.qty, 0)} pcs in total
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="shrink-0 rounded-full bg-brand-700 text-white text-sm font-bold px-5 py-3 inline-flex items-center gap-2 transition-[transform,filter] duration-150 hover:brightness-105 active:scale-[0.97]"
                >
                  Review <span aria-hidden>→</span>
                </button>
              </div>
            )}
          </>
        )}

        {mode === 'in' && (
          <div className={`${cardShell} p-5`}>
            <label htmlFor="worker-receive" className="block text-sm font-bold text-ink mb-2">
              What product arrived?
            </label>
            <input
              id="worker-receive"
              value={receiveQuery}
              onChange={(e) => setReceiveQuery(e.target.value)}
              placeholder="Type name or code — e.g. Airforce"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              className={inputShell}
            />
            {receiveSearching && (
              <p className="mt-3 text-xs text-muted flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-brand-700 border-t-transparent animate-spin" />
                Searching…
              </p>
            )}
            {receiveResults.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {receiveResults.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => pickReceiveProduct(p)}
                      className="w-full flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left transition-[transform,background-color,color] duration-150 hover:border-brand-300 hover:bg-brand-50 active:scale-[0.99]"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink truncate">{p.name}</span>
                        <span className="block text-xs text-muted truncate">{p.category} · {p.sku}</span>
                      </span>
                      <span className="shrink-0 text-xs font-bold text-brand-700 tabular-nums">
                        {p.quantity} on shelf
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {receiveQuery.trim().length >= 2 && !receiveSearching && receiveResults.length === 0 && (
              <p className="mt-3 text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center">
                No product matches — check the name or code.
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  /* ── Product found: quantity + act (take-out vs receive) ──────── */
  return (
    <div className="animate-[slideUp_0.25s_ease]">
      {canReceive && <ModeSwitcher mode={mode} onChange={switchMode} />}

      {mode === 'out' ? (
        <form onSubmit={submitTakeOut} className="space-y-4">
          /* Product photos — confirm it's the right item before taking anything */
          <div className={`${cardShell} overflow-hidden`}>
            {productImages.length > 0 ? (
              <>
                <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-brand-50 to-brand-100/50">
                  <img
                    src={productImages[activeImg]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {product.quantity <= Number(product.reorderLevel || 0) && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-amber-700 text-[11px] font-bold shadow">
                      Low stock
                    </span>
                  )}
                  {productImages.length > 1 && (
                    <>
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/50 text-white text-[11px] font-bold tabular-nums">
                        {activeImg + 1} / {productImages.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveImg((activeImg - 1 + productImages.length) % productImages.length)}
                        aria-label="Previous photo"
                        className="absolute inset-y-0 left-0 w-12 flex items-center justify-center text-white/80 hover:text-white"
                      >
                        <span className="w-8 h-8 rounded-full bg-black/35 flex items-center justify-center">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveImg((activeImg + 1) % productImages.length)}
                        aria-label="Next photo"
                        className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-white/80 hover:text-white"
                      >
                        <span className="w-8 h-8 rounded-full bg-black/35 flex items-center justify-center">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </span>
                      </button>
                    </>
                  )}
                </div>
                {productImages.length > 1 && (
                  <div className="flex gap-2 px-3 py-3 overflow-x-auto">
                    {productImages.map((src, i) => (
                      <button
                        type="button"
                        key={src + i}
                        onClick={() => setActiveImg(i)}
                        aria-label={`View photo ${i + 1}`}
                        className={`w-16 h-12 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-brand-600 ring-2 ring-brand-600/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="relative aspect-[4/3] flex flex-col items-center justify-center gap-2 text-brand-600/50 bg-gradient-to-br from-brand-50 to-brand-100/50">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span className="text-xs font-semibold">No photo added for this product</span>
                {product.quantity <= Number(product.reorderLevel || 0) && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-amber-700 text-[11px] font-bold shadow">
                    Low stock
                  </span>
                )}
              </div>
            )}
          </div>

          {product.status && product.status !== 'VERIFIED' && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 9v4M12 17h.01" />
                </svg>
              </span>
              <p className="text-[13px] font-semibold text-amber-800 leading-snug">
                Not verified yet — this product can't be sold until the manager verifies it.
              </p>
            </div>
          )}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-ink leading-tight">{product.name}</h2>
              <p className="text-xs text-muted mt-0.5">
                {product.category} · code {product.sku}
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="shrink-0 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-full px-3.5 py-2 transition-colors active:scale-[0.98]"
            >
              ← Scan again
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={cardShell}>
              <div className="p-4">
                <p className={microLabel}>Price</p>
                <p className="mt-1 text-lg font-bold text-ink tabular-nums">{currency(product.price)}</p>
              </div>
            </div>
            <div className={cardShell}>
              <div className="p-4">
                <p className={microLabel}>On shelf</p>
                <p className={`mt-1 text-lg font-bold tabular-nums ${maxQty <= Number(product.reorderLevel || 0) ? 'text-amber-600' : 'text-brand-700'}`}>
                  {maxQty}
                </p>
              </div>
            </div>
          </div>

          <div className={`${cardShell} p-5 space-y-4`}>
            <p className={microLabel}>How many are you taking out?</p>

            {/* Cartons — type a half (e.g. 3.5) or tap to step */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink">
                Cartons <span className="text-xs font-normal text-gray-400">(1 = {ppc()} {product.unit || 'pcs'})</span>
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={decCartons}
                  disabled={cartons <= 0}
                  className={stepBtn('minus')}
                  aria-label="Fewer cartons"
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={cartons}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '' || Number(v) >= 0) setCartons(v === '' ? 0 : Number(v))
                  }}
                  aria-label="Number of cartons"
                  className="w-16 text-center text-3xl font-bold text-ink bg-transparent outline-none tabular-nums"
                />
                <button
                  type="button"
                  onClick={incCartons}
                  disabled={mode === 'out' && totalPieces >= maxQty}
                  className={stepBtn('plus')}
                  aria-label="More cartons"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={toggleHalfCarton}
                  disabled={mode === 'out' && totalPieces >= maxQty}
                  className="w-12 h-12 rounded-full inline-flex items-center justify-center text-lg font-bold text-brand-700 border border-brand-200 bg-brand-50 transition-[transform,background-color,color] duration-150 active:scale-[0.94] disabled:opacity-60 disabled:pointer-events-none"
                  aria-label="Half a carton"
                >
                  ½
                </button>
              </div>
            </div>

            {/* Loose pieces */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink">Leftover pieces</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={decPieces}
                  disabled={pieces <= 0}
                  className={stepBtn('minus')}
                  aria-label="Fewer pieces"
                >
                  −
                </button>
                <span className="text-3xl font-bold text-ink w-12 text-center tabular-nums">{pieces}</span>
                <button
                  type="button"
                  onClick={incPieces}
                  disabled={mode === 'out' && totalPieces >= maxQty}
                  className={stepBtn('plus')}
                  aria-label="More pieces"
                >
                  +
                </button>
              </div>
            </div>

            {looseOverLimit && (
              <p className="text-xs text-amber-600 font-semibold text-center">
                Leftover can't exceed {looseLimit} {product.unit || 'pcs'} — that's a full carton.
              </p>
            )}

            {/* Running total — inverted ink strip */}
            <div className="flex items-center justify-between rounded-2xl bg-ink px-4 py-3.5 shadow-[0_10px_24px_-14px_rgba(13,13,13,0.5)]">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Total out</span>
              <span className="text-lg font-bold text-brand-300 tabular-nums">{totalPieces} {product.unit || 'pcs'}</span>
            </div>

            {totalPieces >= maxQty && (
              <p className="text-xs text-amber-600 text-center font-semibold">That's all there is on the shelf.</p>
            )}
          </div>

          <div className={`${cardShell} p-5 space-y-3`}>
            <label className="block text-sm font-bold text-ink">Who is this going to?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDest('customer')}
                className={`rounded-2xl px-4 py-3.5 text-sm font-bold transition-[background-color,border-color,color] duration-150 active:scale-[0.98] ${dest === 'customer' ? 'bg-brand-700 text-white shadow-[0_8px_20px_-10px_rgba(16,134,60,0.7)]' : 'border border-line bg-white text-ink hover:bg-page'}`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setDest('shop')}
                className={`rounded-2xl px-4 py-3.5 text-sm font-bold transition-[background-color,border-color,color] duration-150 active:scale-[0.98] ${dest === 'shop' ? 'bg-brand-700 text-white shadow-[0_8px_20px_-10px_rgba(16,134,60,0.7)]' : 'border border-line bg-white text-ink hover:bg-page'}`}
              >
                Our shop
              </button>
            </div>

            {dest === 'customer' ? (
              <>
                <CustomerPicker value={customer} onChange={setCustomer} compact />
                <p className="text-xs text-muted">Search a saved customer, add a new one, or tap Walk-in.</p>
              </>
            ) : (
              <div className="flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M14 9h1M14 13h1M10 21v-4h4v4" />
                  </svg>
                </span>
                <p className="text-[13px] font-semibold text-brand-800 leading-snug">
                  Stock moves to your own shop — no customer is recorded. Add a reason above to keep your records clear.
                </p>
              </div>
            )}
          </div>

          <div className={`${cardShell} p-5`}>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason (optional) — e.g. shop use or customer order"
              className="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors"
            />
          </div>

          <button type="submit" disabled={submitting || (product.status && product.status !== 'VERIFIED')} className={primaryBtn}>
            {submitting ? (
              <span className="w-6 h-6 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <>
                <span className="w-9 h-9 rounded-full bg-white/20 inline-flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                Take out {totalPieces} × {product.name}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={addToCart}
            disabled={submitting || (product.status && product.status !== 'VERIFIED')}
            className="w-full py-4 rounded-full border border-brand-200 bg-brand-50 text-brand-700 text-sm font-bold inline-flex items-center justify-center gap-2 transition-[transform,background-color,color] duration-150 hover:bg-brand-100 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {cart.length > 0 && (
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center">
                {cart.length}
              </span>
            )}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add & scan another
          </button>
          <p className="text-center text-xs text-muted">
            {cart.some((it) => it.product.id === product.id)
              ? 'Already in your list — adding it again adds another line to it.'
              : 'Take out one now, or add several — they go out together.'}
          </p>
        </form>
      ) : (
        <form onSubmit={submitReceive} className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-ink leading-tight">{product.name}</h2>
              <p className="text-xs text-muted mt-0.5">
                {product.category} · code {product.sku}
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="shrink-0 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-full px-3.5 py-2 transition-colors active:scale-[0.98]"
            >
              ← Choose again
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={cardShell}>
              <div className="p-4">
                <p className={microLabel}>Carton price</p>
                <p className="mt-1 text-lg font-bold text-ink tabular-nums">{currency(product.price)}</p>
              </div>
            </div>
            <div className={cardShell}>
              <div className="p-4">
                <p className={microLabel}>On shelf now</p>
                <p className="mt-1 text-lg font-bold text-brand-700 tabular-nums">{maxQty}</p>
              </div>
            </div>
          </div>

          <div className={`${cardShell} p-5 space-y-4`}>
            <p className={microLabel}>How much arrived?</p>

            {/* Cartons — type a half (e.g. 3.5) or tap to step */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink">
                Cartons <span className="text-xs font-normal text-gray-400">(1 = {ppc()} {product.unit || 'pcs'})</span>
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={decCartons}
                  disabled={cartons <= 0}
                  className={stepBtn('minus')}
                  aria-label="Fewer cartons"
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={cartons}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '' || Number(v) >= 0) setCartons(v === '' ? 0 : Number(v))
                  }}
                  aria-label="Number of cartons"
                  className="w-16 text-center text-3xl font-bold text-ink bg-transparent outline-none tabular-nums"
                />
                <button
                  type="button"
                  onClick={incCartons}
                  className={stepBtn('plus')}
                  aria-label="More cartons"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={toggleHalfCarton}
                  className="w-12 h-12 rounded-full inline-flex items-center justify-center text-lg font-bold text-brand-700 border border-brand-200 bg-brand-50 transition-[transform,background-color,color] duration-150 active:scale-[0.94] disabled:opacity-60 disabled:pointer-events-none"
                  aria-label="Half a carton"
                >
                  ½
                </button>
              </div>
            </div>

            {/* Loose pieces */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink">Leftover pieces</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={decPieces}
                  disabled={pieces <= 0}
                  className={stepBtn('minus')}
                  aria-label="Fewer pieces"
                >
                  −
                </button>
                <span className="text-3xl font-bold text-ink w-12 text-center tabular-nums">{pieces}</span>
                <button
                  type="button"
                  onClick={incPieces}
                  className={stepBtn('plus')}
                  aria-label="More pieces"
                >
                  +
                </button>
              </div>
            </div>

            {looseOverLimit && (
              <p className="text-xs text-amber-600 font-semibold text-center">
                Leftover can't exceed {looseLimit} {product.unit || 'pcs'} — that's a full carton.
              </p>
            )}

            {/* Running total */}
            <div className="flex items-center justify-between rounded-2xl bg-ink px-4 py-3.5 shadow-[0_10px_24px_-14px_rgba(13,13,13,0.5)]">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Total added</span>
              <span className="text-lg font-bold text-brand-300 tabular-nums">{totalPieces} {product.unit || 'pcs'}</span>
            </div>
          </div>

          {totalPieces > 0 && (
            <div className="rounded-2xl bg-brand-50 border border-brand-100 px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-xs text-brand-700 font-medium">
                Batch value — cartons × carton price + loose × {Number(product.unitPrice) ? 'unit price' : 'price ÷ units'}
              </span>
              <span className="text-sm font-bold text-brand-800 tabular-nums shrink-0">
                {currency(valueOfMovement({ price: product.price, unitPrice: product.unitPrice, piecesPerCarton: ppc(), cartons, pieces }))}
              </span>
            </div>
          )}

          <div className={`${cardShell} p-5`}>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Supplier / note (optional)"
              className="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors"
            />
          </div>

          <button type="submit" disabled={submitting || totalPieces <= 0} className={primaryBtn}>
            {submitting ? (
              <span className="w-6 h-6 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <>
                <span className="w-9 h-9 rounded-full bg-white/20 inline-flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                Receive {totalPieces} × {product.name}
              </>
            )}
          </button>
          <p className="text-center text-xs text-muted">Adds to shelf stock · manager sees it instantly</p>
        </form>
      )}
    </div>
  )
}