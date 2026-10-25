/**
 * useNotifications — react binding over notificationApi for a single scope.
 * Re-reads the store whenever any notification changes so bells and pages update live.
 */
import { useState, useEffect, useCallback } from 'react'
import { notificationApi } from '../api/notificationApi'

export function useNotifications(scope) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!scope) return undefined
    const unsub = notificationApi.subscribe(() => setTick((t) => t + 1))
    notificationApi.load(scope)
    const timer = setInterval(() => {
      notificationApi.load(scope)
    }, 20000)
    return () => {
      clearInterval(timer)
      unsub()
    }
  }, [scope])

  const items = scope ? notificationApi.list(scope) : []
  const unread = scope ? notificationApi.unreadCount(scope) : 0

  const markRead = useCallback((id) => {
    if (scope) notificationApi.markRead(id)
  }, [scope])

  const markUnread = useCallback((id) => {
    if (scope) notificationApi.markUnread(id)
  }, [scope])

  const deleteItem = useCallback((id) => {
    if (scope) notificationApi.deleteItem(id)
  }, [scope])

  const clearAll = useCallback(() => {
    if (scope) notificationApi.clearAll(scope)
  }, [scope])

  const markAllRead = useCallback(() => {
    if (scope) notificationApi.markAllRead(scope)
  }, [scope])

  void tick

  return { items, unread, markRead, markUnread, deleteItem, clearAll, markAllRead }
}

export default useNotifications