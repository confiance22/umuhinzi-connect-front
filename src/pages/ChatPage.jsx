/**
 * ChatPage — private per-participant chat.
 *
 * Threads are keyed by member ids: you only ever see conversations you belong
 * to, and a thread with a super admin is anchored on the shop member (so two
 * managers with identical names still get distinct threads). Who can talk to
 * whom: manager ↔ own shop + super admins, worker ↔ own shop, super admin ↔
 * shop managers across shops.
 *
 * Product sharing is an in-shop tool (shop staff only, never in a thread that
 * includes a super admin). "Remove from stock" jumps straight into the take-out
 * flow — workers to the scan screen, managers to Stock Out — with the product
 * preselected. "Details" opens the real product page.
 */
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useChat } from '../hooks/useChat'
import { productApi } from '../api/productApi'
import { useToastContext } from '../context/ToastContext'
import { ROUTE_PATHS } from '../constants/routePaths'
import { ROLES } from '../constants/roles'
import useKbOpen from '../hooks/useKbOpen'

const AVATAR_GRADIENTS = [
  'from-brand-500 to-brand-700',
  'from-emerald-500 to-brand-700',
  'from-brand-400 to-emerald-700',
  'from-teal-500 to-brand-700',
  'from-emerald-600 to-brand-800',
  'from-brand-600 to-emerald-800',
]

const gradientFor = (id) => AVATAR_GRADIENTS[Number(id) % AVATAR_GRADIENTS.length]

const initialsOf = (name) =>
  (name || '?')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const roleLabel = (roleKey) =>
  roleKey === 'shop_manager' ? 'Shop Manager' : roleKey === 'super_admin' ? 'Super Admin' : 'Worker'

const ROLE_PILL = {
  super_admin: 'bg-brand-100 text-brand-800',
  shop_manager: 'bg-emerald-100 text-emerald-800',
  worker: 'bg-teal-100 text-teal-800',
}

/* Each role gets its own quiet chat surface — never loud, always built from
   the neutral palette so photos, bubbles and text stay readable. */
const CHAT_SURFACES = {
  super_admin: {
    pane: 'bg-gradient-to-b from-stone-100/70 to-stone-200/35',
    threadHeader: 'bg-white/80 border-stone-200/80',
    composer: 'bg-white',
  },
  shop_manager: {
    pane: 'bg-gradient-to-b from-brand-50/60 to-brand-100/30',
    threadHeader: 'bg-brand-50/50 border-brand-100',
    composer: 'bg-brand-50/40',
  },
  worker: {
    pane: 'bg-gradient-to-b from-teal-50/70 to-stone-100/40',
    threadHeader: 'bg-white/85 border-teal-100/80',
    composer: 'bg-white',
  },
}

const chatTime = (iso) => {
  if (!iso) return ''
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''
  const now = new Date()
  const sameDay = then.toDateString() === now.toDateString()
  const time = then.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return time
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (then.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return then.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const MessageIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
  </svg>
)

const BackIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const SendIcon = (
  <svg className="w-5 h-5 -ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
)

const PlusIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

/* -- Product card ----------------------------------------------------- */
const ProductCard = ({ product, role }) => {
  const image = product?.photo || null
  const showActions = role === ROLES.SHOP_MANAGER || role === ROLES.WORKER
  return (
    <div className="mt-2.5 w-64 max-w-full sm:w-72 rounded-2xl border border-black/[0.06] bg-white shadow-[0_10px_30px_-18px_rgba(13,13,13,0.35)] overflow-hidden">
      <div className="relative flex items-center gap-3 p-3">
        <div className="w-14 h-14 rounded-xl bg-page border border-line overflow-hidden flex items-center justify-center shrink-0">
          {image ? (
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-semibold text-gray-300">{product?.name?.charAt(0) || '?'}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink truncate">{product?.name || 'Product'}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-emerald-700">
                {product?.quantity ?? 0} {product?.unit || 'pcs'}
              </span>
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted">on shelf</span>
          </div>
        </div>
      </div>
      {showActions && (
        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            type="button"
            data-action="remove"
            className="flex-1 py-2 rounded-xl bg-gradient-to-t from-brand-800 to-brand-600 text-white text-xs font-bold shadow-[0_8px_18px_-10px_rgba(16,134,60,0.7)] transition-[transform,filter] duration-150 hover:brightness-105 active:scale-[0.98]"
          >
            Remove from stock
          </button>
          <button
            type="button"
            data-action="details"
            className="flex-1 py-2 rounded-xl border border-line bg-white text-ink/70 text-xs font-bold transition-[transform,background-color] duration-150 hover:bg-page active:scale-[0.98]"
          >
            Details
          </button>
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  const { user } = useAuth()
  const { showToast } = useToastContext()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const myId = user?.id
  const myRole = user?.roleKey
  const isSuperAdmin = myRole === ROLES.SUPER_ADMIN
  const isWorker = myRole === ROLES.WORKER
  const surface = CHAT_SURFACES[myRole] || CHAT_SURFACES.shop_manager
  const kbOpen = useKbOpen()

  /* While the keyboard is up, the browser auto-pans the page to "reveal" the
     focused field; the chat shell is already shrunk to end exactly at the
     keyboard top, so that pan leaves an empty band below it (the phantom
     white block). Pin the visual viewport to the top while typing so no void
     can appear between the composer and the keys. */
  useEffect(() => {
    if (!kbOpen) return
    const reset = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    reset()
    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', reset)
      vv.addEventListener('scroll', reset)
    }
    const raf = requestAnimationFrame(reset)
    return () => {
      cancelAnimationFrame(raf)
      if (vv) {
        vv.removeEventListener('resize', reset)
        vv.removeEventListener('scroll', reset)
      }
    }
  }, [kbOpen])

  const { threads, members, sending, messagesOf, start, open, send, markAllRead, editMessage, deleteMessage } = useChat()

  const [activeId, setActiveId] = useState(null)
  const [showingNew, setShowingNew] = useState(false)
  const [creatingFor, setCreatingFor] = useState(null)

  const [text, setText] = useState('')
  const [attachMode, setAttachMode] = useState(false)
  const [attachQuery, setAttachQuery] = useState('')
  const [attachResults, setAttachResults] = useState([])
  const [attachSearching, setAttachSearching] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const threadRef = useRef(null)

  const pendingThread = Number(searchParams.get('thread'))

  const activeThread = threads.find((t) => t.id === activeId) || null
  const rawMessages = activeId ? messagesOf(activeId) : []
  const threadMessages = [...rawMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const otherParticipants = (t) => (t.participants || []).filter((p) => Number(p.id) !== Number(myId))
  const threadTitle = (t) => otherParticipants(t).map((o) => o.name).join(', ') || 'Shop chat'
  const threadHasAdmin = (t) => (t.participants || []).some((p) => p.roleKey === ROLES.SUPER_ADMIN)

  const canAttach = !isSuperAdmin && activeThread !== null && !threadHasAdmin(activeThread)

  const threadSub = (t) => {
    const others = otherParticipants(t)
    const labels = others.map((o) => roleLabel(o.roleKey)).join(', ')
    return t.shopName ? `${labels} · ${t.shopName}` : labels
  }

  const previewOf = (t) => {
    const lt = t?.lastMessage
    if (!lt) return 'Start the conversation'
    if (lt.product) return lt.message ? lt.message : `Shared product: ${lt.product.name}`
    return lt.message || ''
  }

  /* Open a thread passed via ?thread= (floating chat quick-access). */
  useEffect(() => {
    if (!pendingThread) return
    const target = threads.find((t) => t.id === pendingThread)
    if (!target) return
    setActiveId(target.id)
    open(target.id)
    setSearchParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingThread, threads.length])

  /* Auto-mark as read whenever something lands in the open thread. */
  useEffect(() => {
    if (activeThread && Number(activeThread.unreadCount) > 0) markAllRead(activeId)
  }, [activeThread, activeId, markAllRead])

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [threadMessages.length])

  /* When the keyboard opens the chat sheet shrinks (shell tracks the visual
     viewport); re-pin to the bottom so the latest message stays visible above
     the input field. */
  useEffect(() => {
    if (!isWorker) return
    if (!window.visualViewport) return
    const onVpResize = () => {
      requestAnimationFrame(() => {
        threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'auto' })
      })
    }
    window.visualViewport.addEventListener('resize', onVpResize)
    return () => window.visualViewport.removeEventListener('resize', onVpResize)
  }, [isWorker, activeId])

  useEffect(() => {
    if (!attachMode || !attachQuery.trim()) {
      setAttachResults([])
      return
    }
    let active = true
    setAttachSearching(true)
    productApi
      .search(attachQuery.trim())
      .then((res) => {
        if (active) setAttachResults(Array.isArray(res) ? res : [])
      })
      .catch(() => {
        if (active) setAttachResults([])
      })
      .finally(() => {
        if (active) setAttachSearching(false)
      })
    return () => {
      active = false
    }
  }, [attachMode, attachQuery])

  const openThread = (t) => {
    setActiveId(t.id)
    open(t.id)
    if (Number(t.unreadCount) > 0) markAllRead(t.id)
  }

  const startThread = async (member) => {
    if (!myId) return
    setCreatingFor(member.id)
    try {
      const t = await start([Number(myId), member.id])
      setShowingNew(false)
      setActiveId(t.id)
      open(t.id)
    } catch (err) {
      showToast(
        err?.response?.status === 500 ? 'Could not start the conversation. Try again.' : err?.response?.data?.message || 'Could not start the conversation.',
        'error',
      )
    } finally {
      setCreatingFor(null)
    }
  }

  const submit = async (e) => {
    if (e) e.preventDefault()
    if (!activeId) return
    const textValue = text.trim()
    const attachId = canAttach ? selectedProduct?.id ?? null : null
    if (!textValue && !attachId) {
      showToast('Write a message or attach a product.', 'error')
      return
    }
    try {
      await send(activeId, { message: textValue, productId: attachId })
      setText('')
      setSelectedProduct(null)
      setAttachMode(false)
      setAttachQuery('')
      setAttachResults([])
    } catch (err) {
      showToast(
        err?.response?.status === 500 ? 'Message not sent. Try again.' : err?.response?.data?.message || 'Could not send the message.',
        'error',
      )
    }
  }

  const productAction = (msg) => (kind) => {
    const { id } = msg.product
    if (kind === 'remove') {
      navigate(isWorker ? `${ROUTE_PATHS.QR_SCAN}?productId=${id}` : `${ROUTE_PATHS.STOCK_OUT}?productId=${id}`)
    } else {
      navigate(ROUTE_PATHS.PRODUCT_DETAIL(id))
    }
  }

  const startEdit = (msg) => {
    setEditingId(msg.id)
    setEditText(msg.message || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const saveEdit = async (msg) => {
    const next = editText.trim()
    if (!next) {
      showToast('Write a message to save the edit.', 'error')
      return
    }
    try {
      await editMessage(activeId, msg.id, next)
      cancelEdit()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not update the message.', 'error')
    }
  }

  const confirmDelete = async (msg) => {
    if (!window.confirm('Delete this message for everyone? This cannot be undone.')) return
    try {
      await deleteMessage(activeId, msg.id)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not delete the message.', 'error')
    }
  }

  const selfList = members.filter((m) => Number(m.id) !== Number(myId))
  const groupedMembers = isSuperAdmin
    ? Object.entries(
        selfList.reduce((acc, m) => {
          const key = m.shopName || 'Other shops'
          ;(acc[key] ||= []).push(m)
          return acc
        }, {}),
      )
    : null

  const memberRow = (m) => (
    <button
      key={m.id}
      type="button"
      onClick={() => startThread(m)}
      disabled={creatingFor === m.id}
      className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-page transition-colors text-left"
    >
      <span className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradientFor(m.id)} text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-[0_6px_14px_-8px_rgba(13,13,13,0.5)]`}>
        {initialsOf(m.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink truncate">{m.name}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${ROLE_PILL[m.roleKey] || 'bg-page text-muted'}`}>
            {roleLabel(m.roleKey)}
          </span>
        </span>
        {m.shopName && (
          <span className="block text-xs text-muted truncate">{m.shopName}</span>
        )}
      </span>
      {creatingFor === m.id ? (
        <span className="w-4 h-4 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin shrink-0" />
      ) : (
        <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )

  return (
    <div
      className={`${
        isWorker
          ? 'flex-1 min-h-0 flex flex-col overflow-hidden bg-card'
          : 'h-[calc(var(--app-height,100vh)-9rem)] min-h-[480px] flex flex-col lg:flex-row max-w-6xl mx-auto overflow-hidden rounded-3xl border border-line bg-card shadow-soft'
      }`}
    >
      {/* Conversation list */}
      <aside className={`flex flex-col w-full ${isWorker ? 'flex-1 min-h-0' : 'lg:w-80 lg:border-r border-line'} bg-white/70 ${isWorker ? (activeId && !showingNew ? 'hidden' : 'flex') : (activeId && !showingNew ? 'hidden lg:flex' : 'flex')}`}>
        <div className={`px-4 sm:px-5 border-b border-line flex items-center justify-between shrink-0 ${isWorker ? 'py-3 bg-white/90' : 'py-4 bg-gradient-to-r from-brand-50/80 to-transparent'}`}>
          <div className="flex items-center gap-3">
            {!isWorker && (
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-[0_10px_24px_-12px_rgba(16,134,60,0.7)]">
                {MessageIcon}
              </span>
            )}
            <div>
              <h1 className="text-lg font-bold tracking-tight text-ink leading-none">Chat</h1>
              {!isWorker && (
                <p className="text-xs text-muted mt-1">
                  {isSuperAdmin ? 'All shops · managers' : 'Your shop + admins'}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowingNew((v) => !v)
              setActiveId(null)
            }}
            aria-label="Start a new chat"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
              showingNew ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            }`}
          >
            {PlusIcon}
          </button>
        </div>

        {showingNew ? (
          <div className="px-3 pt-3 shrink-0">
            <div className="rounded-2xl border border-line bg-card shadow-soft">
              <p className="px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-muted">
                Start a conversation
              </p>
              <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                {selfList.length === 0 ? (
                  <p className="text-xs text-muted px-3 py-3">
                    {isSuperAdmin
                      ? 'No shop managers yet.'
                      : 'No other staff in this shop yet.'}
                  </p>
                ) : groupedMembers ? (
                  groupedMembers.map(([shopName, list]) => (
                    <div key={shopName}>
                      <p className="px-3 pt-2 pb-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        {shopName}
                      </p>
                      <div className="space-y-0.5">{list.map(memberRow)}</div>
                    </div>
                  ))
                ) : (
                  selfList.map(memberRow)
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
          {threads.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-brand-50 text-brand-700 flex items-center justify-center">
                {MessageIcon}
              </div>
              <p className="text-sm font-semibold text-ink mt-4">No conversations yet</p>
              <p className="text-xs text-muted mt-1">
                {isSuperAdmin
                  ? 'Tap + to reach a shop manager and stay in the loop.'
                  : 'Tap + to message your team.'}
              </p>
            </div>
          ) : (
            threads.map((t) => {
              const unreadCount = Number(t.unreadCount) || 0
              const others = otherParticipants(t)
              const first = others[0]
              const isActive = activeId === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setShowingNew(false)
                    openThread(t)
                  }}
                  className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                    isActive ? 'bg-brand-50 border border-brand-100' : 'hover:bg-page border border-transparent'
                  }`}
                >
                  <span className="relative shrink-0">
                    <span
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradientFor(first?.id || t.id)} text-white text-sm font-bold flex items-center justify-center shadow-[0_8px_18px_-10px_rgba(13,13,13,0.5)]`}
                    >
                      {initialsOf(first?.name || threadTitle(t))}
                    </span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-ink truncate">{threadTitle(t)}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{chatTime(t.updatedAt)}</span>
                    </span>
                    <span className={`block text-xs truncate ${unreadCount > 0 ? 'text-ink font-semibold' : 'text-muted'}`}>
                      {previewOf(t)}
                    </span>
                    <span className="block text-[10px] text-gray-400 truncate mt-0.5">{threadSub(t)}</span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* Thread view */}
      <section
        className={`flex-1 min-h-0 flex flex-col min-w-0 ${surface.pane} ${
          activeId ? 'flex' : isWorker ? 'hidden' : 'hidden lg:flex'
        }`}
      >
        {!activeThread ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-700 flex items-center justify-center">
              {MessageIcon}
            </div>
            <p className="text-sm font-semibold text-ink mt-4">No conversation open</p>
            <p className="text-xs text-muted mt-1 max-w-[260px]">
              Pick a conversation on the left, or tap + to start a new one.
            </p>
          </div>
        ) : (
          <>
            <div className={`px-4 sm:px-6 py-4 border-b flex items-center gap-3 shrink-0 backdrop-blur ${surface.threadHeader}`}>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="lg:hidden p-2 -ml-2 rounded-xl text-gray-400 hover:text-ink hover:bg-page transition-colors"
                aria-label="Back to conversations"
              >
                {BackIcon}
              </button>
              <span className="relative shrink-0">
                <span
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradientFor(activeThread.id)} text-white text-sm font-bold flex items-center justify-center shadow-[0_8px_18px_-10px_rgba(13,13,13,0.5)]`}
                >
                  {initialsOf(threadTitle(activeThread))}
                </span>
                {otherParticipants(activeThread).length > 1 && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-500 border-2 border-white flex items-center justify-center">
                    <span className="text-[7px] font-bold text-white">{otherParticipants(activeThread).length}</span>
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-ink truncate">{threadTitle(activeThread)}</h2>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  {otherParticipants(activeThread).map((o) => (
                    <span key={o.id} className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${ROLE_PILL[o.roleKey] || 'bg-page text-muted'}`}>
                      {roleLabel(o.roleKey)}
                    </span>
                  ))}
                  {activeThread.shopName && (
                    <span className="rounded-full bg-page text-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                      {activeThread.shopName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div ref={threadRef} className={`flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pt-5 space-y-5 ${isWorker ? 'pb-4' : 'py-5 pb-16'}`}>
              {threadMessages.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm font-semibold text-ink">Say hello</p>
                  <p className="text-xs text-muted mt-1">
                    {canAttach ? 'Share a product right in the message.' : 'Message your team.'}
                  </p>
                </div>
              ) : (
                threadMessages.map((msg) => {
                  const mine = Number(msg.senderId) === Number(myId)
                  const senderName = msg.senderName || 'Team member'
                  return (
                    <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-[78%] min-w-0 ${mine ? 'items-end' : 'items-start'}`}>
                        {!mine && (
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradientFor(msg.senderId)} text-white text-[9px] font-bold flex items-center justify-center shrink-0`}>
                              {initialsOf(senderName)}
                            </span>
                            <span className="text-xs font-semibold text-ink/80 truncate">{senderName}</span>
                            <span className="text-[9px] uppercase tracking-wide text-gray-400 font-bold shrink-0">
                              {roleLabel(msg.senderRole)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            msg.deleted
                              ? 'bg-page border border-line text-muted italic'
                              : mine
                                ? 'bg-gradient-to-t from-brand-700 to-brand-500 text-white rounded-br-md shadow-[0_10px_26px_-14px_rgba(16,134,60,0.7)]'
                                : 'bg-white/90 border border-brand-100 text-ink rounded-bl-md shadow-[0_8px_20px_-16px_rgba(13,13,13,0.3)]'
                          }`}
                        >
                          {msg.deleted ? (
                            <p className="text-[13px] leading-relaxed">This message was deleted.</p>
                          ) : editingId === msg.id ? (
                            <div className="space-y-2">
                              <textarea
                                autoFocus
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={2}
                                placeholder="Edit message…"
                                className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => saveEdit(msg)}
                                  className="rounded-lg bg-brand-700 text-white px-3 py-1.5 text-xs font-bold hover:bg-brand-800 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="rounded-lg bg-page text-muted px-3 py-1.5 text-xs font-bold hover:bg-ink/5 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {msg.message ? (
                                <p className={`text-[15px] leading-relaxed ${mine ? 'text-white' : 'text-ink'}`}>{msg.message}</p>
                              ) : null}
                              {msg.product ? (
                                <ProductCard product={msg.product} role={myRole} />
                              ) : null}
                            </>
                          )}
                          {!msg.deleted && (
                            <div className={`mt-1.5 flex items-center gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                              <p className={`text-[10px] uppercase tracking-wide font-semibold ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                                {chatTime(msg.createdAt)}
                                {msg.edited ? ' · edited' : ''}
                              </p>
                              {mine && editingId !== msg.id && (
                                <button
                                  type="button"
                                  onClick={() => startEdit(msg)}
                                  className={`p-0.5 rounded ${mine ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-brand-700'} transition-colors`}
                                  aria-label="Edit message"
                                >
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
                                  </svg>
                                </button>
                              )}
                              {isSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={() => confirmDelete(msg)}
                                  className={`p-0.5 rounded ${mine ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-rose-600'} transition-colors`}
                                  aria-label="Delete message"
                                >
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Composer — bottom padding collapses to 0 while the keyboard is
                open so the field sits flush above the keys (no dead band where
                the hidden navbar used to be). */}
            <div
              className={`border-t border-line px-3 sm:px-5 pt-3 pb-3 shrink-0 backdrop-blur ${isWorker ? 'bg-white' : `${surface.composer} pb-3`}`}
              style={isWorker ? { paddingBottom: kbOpen ? '2.5rem' : '0.75rem' } : undefined}
            >
              {attachMode && canAttach && (
                <div className="mb-3 rounded-2xl border border-line bg-page p-3">
                  <input
                    autoFocus
                    value={attachQuery}
                    onChange={(e) => setAttachQuery(e.target.value)}
                    placeholder="Search a product to share…"
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors"
                  />
                  <div className="mt-2 space-y-1 max-h-52 overflow-y-auto">
                    {attachSearching && <p className="text-xs text-muted px-2 py-2">Searching…</p>}
                    {!attachSearching && attachQuery.trim() && attachResults.length === 0 && (
                      <p className="text-xs text-muted px-2 py-2">No products match “{attachQuery}”.</p>
                    )}
                    {attachResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProduct(p)
                          setAttachMode(false)
                          setAttachQuery('')
                        }}
                        className="w-full flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-white group transition-colors text-left"
                      >
                        <span className="w-9 h-9 rounded-lg bg-white border border-line overflow-hidden flex items-center justify-center shrink-0">
                          {p.photo ? (
                            <img src={p.photo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-gray-300 font-semibold">{p.name?.charAt(0)}</span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink truncate">{p.name}</span>
                          <span className="block text-xs text-muted truncate">
                            {p.quantity} {p.unit || 'pcs'} on shelf
                          </span>
                        </span>
                        <span className="text-xs font-semibold text-brand-700">Attach</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct && canAttach && (
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2">
                  <span className="w-8 h-8 rounded-md bg-white border border-line overflow-hidden flex items-center justify-center shrink-0">
                    {selectedProduct.photo ? (
                      <img src={selectedProduct.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-300 font-semibold">{selectedProduct.name?.charAt(0)}</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink truncate">{selectedProduct.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="p-1 rounded-md text-gray-400 hover:text-ink transition-colors"
                    aria-label="Remove attached product"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}

              <form onSubmit={submit} className="flex items-end gap-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submit()
                    }
                  }}
                  rows={2}
                  placeholder={canAttach ? 'Message…' : 'Message…'}
                  className="flex-1 resize-none rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors"
                />
                {canAttach && (
                  <button
                    type="button"
                    onClick={() => setAttachMode((v) => !v)}
                    aria-label="Attach a product"
                    className={`w-12 h-[46px] shrink-0 rounded-2xl border flex items-center justify-center transition-colors ${
                      attachMode ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-line bg-white text-gray-400 hover:text-ink'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={sending || (!text.trim() && (!selectedProduct || !canAttach))}
                  className="w-12 h-[46px] shrink-0 rounded-2xl bg-gradient-to-t from-brand-800 to-brand-600 text-white flex items-center justify-center shadow-[0_10px_24px_-12px_rgba(16,134,60,0.7),inset_0_1px_0_rgba(255,255,255,0.22)] transition-[transform,filter] duration-150 hover:brightness-105 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                  aria-label="Send message"
                >
                  {sending ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    SendIcon
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  )
}