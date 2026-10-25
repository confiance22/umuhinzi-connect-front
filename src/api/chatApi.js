/**
 * chatApi.js — per-participant shop chat bus between managers and workers.
 *
 * Conversations are threads keyed by the sorted set of participant user ids.
 * The backend only ever returns threads the calling user belongs to (plus the
 * shop's staff list for starting new chats), so a worker literally cannot
 * receive or read a managers-only conversation. This store mirrors that: it
 * holds my threads, the shop's members, and a message cache per thread.
 */
import axiosInstance from './axiosInstance'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

const STORE = { threads: [], members: [], messages: {} }
const listeners = new Set()

const emit = () => {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch {
      /* subscribers must not break the bus */
    }
  })
}

const unwrapApiResult = (response) => {
  if (response?.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data
  }
  return response.data
}

const asList = (data) => (Array.isArray(data) ? data : [])

export const chatApi = {
  /** Pull my threads + the shop's staff list together. */
  async loadAll() {
    try {
      const [threads, members] = await Promise.all([
        axiosInstance.get(`${API_ENDPOINTS.CHAT.THREADS}`),
        axiosInstance.get(`${API_ENDPOINTS.CHAT.MEMBERS}`),
      ])
      STORE.threads = asList(unwrapApiResult(threads))
      STORE.members = asList(unwrapApiResult(members))
      emit()
      return true
    } catch {
      return false
    }
  },

  async loadThreads() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CHAT.THREADS)
      STORE.threads = asList(unwrapApiResult(response))
      emit()
      return true
    } catch {
      return false
    }
  },

  async loadMessages(threadId) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.CHAT.THREAD_MESSAGES(threadId),
      )
      STORE.messages[threadId] = asList(unwrapApiResult(response))
      emit()
      return true
    } catch {
      return false
    }
  },

  /** Find-or-create a conversation between me and the given participants. */
  async start(participantIds) {
    const response = await axiosInstance.post(API_ENDPOINTS.CHAT.THREADS, { participantIds })
    await Promise.all([chatApi.loadThreads(), chatApi.loadMessages(response.data?.data?.id ?? unwrapApiResult(response)?.id)])
    return unwrapApiResult(response)
  },

  /** Send a message (with an optional product) into a thread. */
  async send(threadId, { message = '', productId = null }) {
    const response = await axiosInstance.post(API_ENDPOINTS.CHAT.THREAD_MESSAGES(threadId), {
      message: String(message || '').trim(),
      productId: productId == null ? undefined : Number(productId),
    })
    const created = unwrapApiResult(response)
    if (created?.id) {
      const list = STORE.messages[threadId] || []
      STORE.messages[threadId] = [created, ...list]
      STORE.threads = STORE.threads.map((t) =>
        t.id === threadId
          ? { ...t, lastMessage: created, unreadCount: 0, updatedAt: new Date().toISOString() }
          : t,
      )
      STORE.threads.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      emit()
    }
    return created
  },

  /** Mark every message in a thread as read by me. */
  async markAllRead(threadId) {
    await axiosInstance.post(API_ENDPOINTS.CHAT.THREAD_READ(threadId))
    if (STORE.messages[threadId]?.some((m) => !m.read)) {
      STORE.messages[threadId] = STORE.messages[threadId].map((m) => (m.read ? m : { ...m, read: true }))
    }
    if (STORE.threads.some((t) => t.id === threadId && t.unreadCount > 0)) {
      STORE.threads = STORE.threads.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
    }
    emit()
  },

  /** Edit one of my messages (server enforces ownership). */
  async editMessage(threadId, messageId, message) {
    const response = await axiosInstance.patch(API_ENDPOINTS.CHAT.THREAD_MESSAGE(threadId, messageId), {
      message: String(message || '').trim(),
    })
    const updated = unwrapApiResult(response)
    if (updated?.id && STORE.messages[threadId]) {
      STORE.messages[threadId] = STORE.messages[threadId].map((m) => (m.id === updated.id ? updated : m))
      STORE.threads = STORE.threads.map((t) =>
        t.id === threadId && t.lastMessage?.id === updated.id ? { ...t, lastMessage: updated } : t,
      )
      emit()
    }
    return updated
  },

  /** Soft-delete a message — super admin only (server enforces the role). */
  async deleteMessage(threadId, messageId) {
    const response = await axiosInstance.delete(API_ENDPOINTS.CHAT.THREAD_MESSAGE(threadId, messageId))
    const updated = unwrapApiResult(response)
    if (updated?.id && STORE.messages[threadId]) {
      STORE.messages[threadId] = STORE.messages[threadId].map((m) => (m.id === updated.id ? updated : m))
      STORE.threads = STORE.threads.map((t) =>
        t.id === threadId && t.lastMessage?.id === updated.id ? { ...t, lastMessage: null } : t,
      )
      emit()
    }
    return updated
  },

  threads() {
    return [...STORE.threads]
  },

  members() {
    return [...STORE.members]
  },

  messages(threadId) {
    return [...(STORE.messages[threadId] || [])]
  },

  totalUnread() {
    return STORE.threads.reduce((sum, t) => sum + (Number(t.unreadCount) || 0), 0)
  },

  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}

export default chatApi