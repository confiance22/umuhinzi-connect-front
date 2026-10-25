/**
 * useChat — react binding over chatApi. Subscribes to the store, loads my
 * threads + the shop's members on mount, and polls every 20s so new messages
 * surface live on badges and open conversations.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { chatApi } from '../api/chatApi'

export function useChat() {
  const [tick, setTick] = useState(0)
  const [sending, setSending] = useState(false)
  const readLock = useRef(new Set())

  useEffect(() => {
    const unsub = chatApi.subscribe(() => setTick((t) => t + 1))
    chatApi.loadAll()
    const timer = setInterval(() => {
      chatApi.loadAll()
    }, 20000)
    return () => {
      clearInterval(timer)
      unsub()
    }
  }, [])

  const threads = chatApi.threads()
  const members = chatApi.members()
  const unread = chatApi.totalUnread()

  const messagesOf = useCallback((threadId) => chatApi.messages(threadId), [tick])

  const start = useCallback(async (participantIds) => {
    const thread = await chatApi.start(participantIds)
    return thread
  }, [])

  const open = useCallback((threadId) => {
    chatApi.loadMessages(threadId)
  }, [])

  const send = useCallback(async (threadId, { message, productId }) => {
    setSending(true)
    try {
      return await chatApi.send(threadId, { message, productId })
    } finally {
      setSending(false)
    }
  }, [])

  const markAllRead = useCallback((threadId) => {
    if (readLock.current.has(threadId)) return
    readLock.current.add(threadId)
    chatApi
      .markAllRead(threadId)
      .catch(() => {})
      .finally(() => {
        readLock.current.delete(threadId)
      })
  }, [])

  const editMessage = useCallback(async (threadId, messageId, message) => {
    return chatApi.editMessage(threadId, messageId, message)
  }, [])

  const deleteMessage = useCallback(async (threadId, messageId) => {
    return chatApi.deleteMessage(threadId, messageId)
  }, [])

  void tick

  return { threads, members, unread, sending, messagesOf, start, open, send, markAllRead, editMessage, deleteMessage }
}

export default useChat