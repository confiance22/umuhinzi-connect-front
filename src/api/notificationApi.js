/**
 * notificationApi.js — scope-based notification bus, server-backed.
 *
 * Mirrors the live /notifications endpoints (list / read / read-all / delete)
 * for a single scope. useNotifications(scope) subscribes, loads on mount and
 * polls every 20s so bells and pages update live.
 *
 * Scopes:
 *   'system'             → Super Admin portal bell (platform/system only)
 *   'shop' | 'shop:{id}' → Shop Manager bell (everything happening in the shop)
 *   'user:{id}'          → private channel (chat messages); merged into the
 *                          active bell scope automatically via matchesScope.
 */
import axiosInstance from './axiosInstance'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

const USER_KEY = 'stockrwa_user'

const STORE = [] // { id, scope, type, title, message, time, read }
const listeners = new Set()

const emit = () => {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch {
      /* subscriber must not break the bus */
    }
  })
}

const timeAgoString = (iso) => {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000))
  const units = [
    ['minute', 60],
    ['hour', 3600],
    ['day', 86400],
    ['week', 604800],
  ]
  if (seconds < 60) return 'just now'
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs)
    if (value < 60 || label === 'week') return `${value} ${label}${value > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

/** Real backend scope the UI scope maps to ('shop' → 'shop:{userShopId}'). */
const effectiveScope = (scope) => {
  if (!scope || scope === 'system' || scope.startsWith('shop:')) return scope
  try {
    const stored = JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    if (stored?.shopId) return `shop:${stored.shopId}`
  } catch {
    /* ignore */
  }
  return scope
}

const matchesScope = (n, scope) =>
  n.scope === scope ||
  n.scope.startsWith('user:') ||
  (scope.startsWith('shop') && n.scope.startsWith('shop'))

const unwrapApiResult = (response) => {
  if (response?.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data
  }
  return response.data
}

export const notificationApi = {
  /** Sync with the backend for a scope. Resolves true on success. */
  async load(scope) {
    if (!scope) return false
    const serverScope = effectiveScope(scope)
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.BASE, {
        params: { scope: serverScope },
      })
      const items = unwrapApiResult(response)
      if (!Array.isArray(items)) return false

      let i = STORE.length
      while (i--) {
        if (matchesScope(STORE[i], serverScope)) STORE.splice(i, 1)
      }
      items.forEach((n) => {
        STORE.push({ ...n, scope: n.scope || serverScope })
      })
      STORE.length = Math.min(STORE.length, 500)
      emit()
      return true
    } catch {
      return false
    }
  },

  list(scope) {
    if (!scope) return []
    return STORE.filter((n) => matchesScope(n, scope)).sort(
      (a, b) => new Date(b.time) - new Date(a.time),
    )
  },

  unreadCount(scope) {
    if (!scope) return 0
    return STORE.filter((n) => matchesScope(n, scope) && !n.read).length
  },

  markRead(id) {
    const hit = STORE.find((n) => n.id === id)
    if (!hit) return
    if (!hit.read) {
      hit.read = true
      emit()
    }
    axiosInstance
      .post(API_ENDPOINTS.NOTIFICATIONS.READ(id))
      .then(() => notificationApi.load(hit.scope))
      .catch(() => {
        /* keep optimistic; the next poll reconciles */
      })
  },

  markUnread(id) {
    const hit = STORE.find((n) => n.id === id)
    if (!hit) return
    if (hit.read) {
      hit.read = false
      emit()
    }
    axiosInstance
      .post(API_ENDPOINTS.NOTIFICATIONS.READ(id), { read: false })
      .then(() => notificationApi.load(hit.scope))
      .catch(() => {
        /* keep optimistic; the next poll reconciles */
      })
  },

  deleteItem(id) {
    const index = STORE.findIndex((n) => n.id === id)
    if (index === -1) return
    const hit = STORE[index]
    STORE.splice(index, 1)
    emit()
    axiosInstance
      .delete(API_ENDPOINTS.NOTIFICATIONS.ITEM(id))
      .then(() => notificationApi.load(hit.scope))
      .catch(() => {
        /* if the delete failed the next poll restores it */
      })
  },

  clearAll(scope) {
    if (!scope) return
    let i = STORE.length
    while (i--) {
      const n = STORE[i]
      if (matchesScope(n, scope)) {
        if (n.id) n.read = true
        else STORE.splice(i, 1)
      }
    }
    emit()
    const serverScope = effectiveScope(scope)
    axiosInstance
      .post(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, { scope: serverScope })
      .then(() => notificationApi.load(scope))
      .catch(() => {
        /* keep local behavior offline */
      })
  },

  markAllRead(scope) {
    let changed = false
    STORE.forEach((n) => {
      if (matchesScope(n, scope) && !n.read) {
        n.read = true
        changed = true
      }
    })
    if (changed) emit()
    const serverScope = effectiveScope(scope)
    axiosInstance
      .post(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, { scope: serverScope })
      .then(() => notificationApi.load(scope))
      .catch(() => {
        /* keep local behavior offline */
      })
  },

  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  timeAgo: timeAgoString,
}

export default notificationApi