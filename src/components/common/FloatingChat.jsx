/**
 * FloatingChat — an in-place chat widget that floats over every page.
 * Click the bubble → a panel with your recent conversations. Click a person →
 * the conversation expands right there (messages + composer) like classic site
 * chat widgets — no navigation to the full chat page needed.
 */
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi } from '../../api/chatApi'
import { useAuth } from '../../hooks/useAuth'
import { useChat } from '../../hooks/useChat'
import { ROUTE_PATHS } from '../../constants/routePaths'
import { ROLES } from '../../constants/roles'

const initialsOf = (name) =>
  (name || '?')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const AVATAR = 'from-brand-500 to-brand-700'

const roleLabel = (roleKey) =>
  roleKey === 'shop_manager' ? 'Management' : roleKey === 'super_admin' ? 'Admin' : 'Staff'

const chatTime = (iso) => {
  if (!iso) return ''
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''
  const now = new Date()
  return then.toDateString() === now.toDateString()
    ? then.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : then.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function FloatingChat({ dockRaised = false }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { threads, unread, messagesOf, open, send, markAllRead, sending, editMessage, deleteMessage } = useChat()
  const [openPanel, setOpenPanel] = useState(false)
  const [threadId, setThreadId] = useState(null)
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const panelRef = useRef(null)
  const fabRef = useRef(null)
  const scrollRef = useRef(null)

  const isAdmin = user?.roleKey === ROLES.SUPER_ADMIN
  const chatPath = isAdmin ? ROUTE_PATHS.ADMIN_CHAT : ROUTE_PATHS.CHAT
  const bottom = dockRaised ? 'bottom-[calc(5.75rem+var(--kb-inset,0px))]' : 'bottom-[calc(1.25rem+var(--kb-inset,0px))]'

  const activeThread = threads.find((t) => t.id === threadId) || null
  const messages = (activeThread ? messagesOf(activeThread.id) : [])
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  /* Close on outside click / Esc. */
  useEffect(() => {
    if (!openPanel) return
    const onDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && (fabRef.current && !fabRef.current.contains(e.target))) {
        setOpenPanel(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenPanel(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openPanel])

  /* Keep the open conversation live while the widget is up. */
  useEffect(() => {
    if (!openPanel || !threadId) return
    const timer = setInterval(() => {
      chatApi.loadMessages(threadId)
      markAllRead(threadId)
    }, 7000)
    return () => clearInterval(timer)
  }, [openPanel, threadId, markAllRead])

  /* Pin the newest message into view. */
  useEffect(() => {
    if (scrollRef.current && openPanel && threadId) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, openPanel, threadId])

  const selectThread = (t) => {
    setThreadId(t.id)
    open(t.id)
    markAllRead(t.id)
  }

  const sendMessage = (e) => {
    e?.preventDefault()
    if (!threadId || sending) return
    const msg = text.trim()
    if (!msg) return
    setText('')
    send(threadId, { message: msg }).catch(() => setText(msg))
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
    if (!next) return
    try {
      await editMessage(threadId, msg.id, next)
      cancelEdit()
    } catch {
      cancelEdit()
    }
  }

  const confirmDelete = async (msg) => {
    if (!window.confirm('Delete this message for everyone? This cannot be undone.')) return
    try {
      await deleteMessage(threadId, msg.id)
    } catch {
      /* ignored */
    }
  }

  const titleOf = (t) =>
    (t.participants || [])
      .filter((p) => Number(p.id) !== Number(user?.id))
      .map((p) => p.name)
      .join(', ') || 'Shop chat'

  const previewOf = (t) => {
    const lt = t?.lastMessage
    if (!lt) return 'Say hi 👋'
    if (lt.product) return lt.message ? lt.message : `Shared product: ${lt.product.name}`
    return lt.message || ''
  }

  return (
    <>
      {openPanel && (
        <div
          ref={panelRef}
          className={`fixed z-[90] ${bottom} right-4 sm:right-6 w-[calc(100vw-2rem)] max-w-sm h-[min(580px,calc(var(--app-height,100dvh)-8rem))] flex flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-[0_30px_70px_-24px_rgba(13,13,13,0.5)] animate-[fadeIn_0.18s_ease]`}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2.5 shrink-0 bg-gradient-to-r from-brand-700 to-brand-500 text-white">
            {activeThread ? (
              <button
                type="button"
                onClick={() => setThreadId(null)}
                className="p-1.5 -ml-1.5 rounded-lg text-white/85 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Back to conversations"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            ) : (
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/15">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
                </svg>
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-none truncate">
                {activeThread ? titleOf(activeThread) : 'Quick chat'}
              </p>
              <p className="text-[10px] text-white/70 mt-0.5 truncate">
                {activeThread
                  ? (activeThread.shopName || '') + (activeThread.shopName ? ' · ' : '') + (activeThread.participants || [])
                      .filter((p) => Number(p.id) !== Number(user?.id))
                      .map((p) => roleLabel(p.roleKey))
                      .join(', ')
                  : isAdmin
                    ? 'All shops · management'
                    : 'Your conversations'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenPanel(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          {activeThread ? (
            <>
              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-3 bg-gradient-to-b from-brand-50/60 to-brand-100/30">
                {messages.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm font-semibold text-ink">Say hello</p>
                    <p className="text-xs text-muted mt-1">Start the conversation here.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const mine = Number(msg.senderId) === Number(user?.id)
                    return (
                      <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[86%] ${mine ? 'items-end' : 'items-start'}`}>
                          {!mine && (
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-1">
                              {msg.senderName || 'Team member'}
                            </p>
                          )}
                          <div
                            className={`rounded-2xl px-3.5 py-2.5 ${
                              msg.deleted
                                ? 'bg-page border border-line text-muted italic'
                                : mine
                                  ? 'bg-gradient-to-t from-brand-700 to-brand-500 text-white rounded-br-md shadow-[0_10px_26px_-14px_rgba(16,134,60,0.7)]'
                                  : 'bg-white border border-brand-100 text-ink rounded-bl-md'
                            }`}
                          >
                            {msg.deleted ? (
                              <p className="text-xs leading-relaxed">This message was deleted.</p>
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
                                    className="rounded-lg bg-brand-700 text-white px-3 py-1 text-xs font-bold hover:bg-brand-800 transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="rounded-lg bg-page text-muted px-3 py-1 text-xs font-bold hover:bg-ink/5 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {msg.message ? <p className="text-sm leading-relaxed">{msg.message}</p> : null}
                                {msg.product && (
                                  <div className={`flex items-center gap-2.5 rounded-xl mt-2 p-2 ${mine ? 'bg-white/15' : 'bg-brand-50 border border-brand-100'}`}>
                                    <span className="w-9 h-9 rounded-lg overflow-hidden bg-white border border-line flex items-center justify-center shrink-0">
                                      {msg.product.photo ? (
                                        <img src={msg.product.photo} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-xs text-gray-300 font-semibold">{msg.product.name?.charAt(0)}</span>
                                      )}
                                    </span>
                                    <span className="min-w-0">
                                      <span className={`block text-xs font-bold truncate ${mine ? 'text-white' : 'text-ink'}`}>{msg.product.name}</span>
                                      <span className={`block text-[10px] truncate ${mine ? 'text-white/75' : 'text-muted'}`}>
                                        {msg.product.quantity} {msg.product.unit || 'pcs'} on shelf
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                            {!msg.deleted && (
                              <div className={`mt-1 flex items-center gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                                <p className={`text-[9px] uppercase tracking-wide font-semibold ${mine ? 'text-white/65' : 'text-gray-400'}`}>
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
                                {isAdmin && (
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

              <form onSubmit={sendMessage} className="flex items-end gap-2 px-3 py-3 shrink-0 border-t border-line bg-white/95 backdrop-blur pb-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  rows={1}
                  placeholder="Message…"
                  className="flex-1 resize-none rounded-2xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors max-h-28"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  aria-label="Send message"
                  className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-t from-brand-800 to-brand-600 text-white flex items-center justify-center shadow-[0_10px_24px_-12px_rgba(16,134,60,0.7)] transition-[transform,filter] duration-150 hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <svg className="w-[18px] h-[18px] ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
              {threads.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <p className="text-sm font-semibold text-ink">No conversations yet</p>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenPanel(false)
                      navigate(chatPath)
                    }}
                    className="mt-2 text-xs font-semibold text-brand-700 hover:text-brand-800"
                  >
                    Open chat to start one →
                  </button>
                </div>
              ) : (
                threads.slice(0, 8).map((t) => {
                  const unreadCount = Number(t.unreadCount) || 0
                  const others = titleOf(t)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => selectThread(t)}
                      className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-page transition-colors text-left"
                    >
                      <span className="relative shrink-0">
                        <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR} text-white text-xs font-bold flex items-center justify-center`}>
                          {initialsOf(others)}
                        </span>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-ink truncate">{others}</span>
                          <span className="text-[10px] text-gray-400 shrink-0">{chatTime(t.updatedAt)}</span>
                        </span>
                        <span className={`block text-xs truncate ${unreadCount > 0 ? 'text-ink font-semibold' : 'text-muted'}`}>
                          {previewOf(t)}
                        </span>
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}

      <button
        ref={fabRef}
        type="button"
        onClick={() => setOpenPanel((o) => !o)}
        aria-label="Open chat"
        className={`fixed z-[90] ${bottom} right-4 sm:right-6 h-14 w-14 rounded-2xl bg-gradient-to-t from-brand-800 to-brand-500 text-white flex items-center justify-center shadow-[0_18px_38px_-14px_rgba(16,134,60,0.8),0_4px_10px_rgba(13,13,13,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-150 active:scale-95 hover:scale-105`}
      >
        {openPanel ? (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
          </svg>
        )}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </>
  )
}