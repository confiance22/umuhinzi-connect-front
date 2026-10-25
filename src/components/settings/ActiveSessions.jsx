/**
 * ActiveSessions — lists every device signed into the account with per-device
 * sign-out. Used on the Shop Manager security page and the Super Admin
 * security page. Backed by GET/POST /auth/sessions.
 */
import React, { useEffect, useCallback, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToastContext } from '../../context/ToastContext'
import { authApi } from '../../api/authApi'

const isMobile = (s) => /iPhone|iPad|Android|Mobile/i.test(`${s?.os || ''} ${s?.browser || ''} ${s?.device || ''}`)

const formatAgo = (iso) => {
  if (!iso) return 'Recently'
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return 'Active now'
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `Active ${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Active ${hrs} h ago`
  const days = Math.floor(hrs / 24)
  return `Active ${days} d ago`
}

const DeviceIcon = ({ session }) =>
  isMobile(session) ? (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  ) : (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )

export const ActiveSessions = () => {
  const { logout } = useAuth()
  const { showToast } = useToastContext()

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busySid, setBusySid] = useState(null)
  const [confirmSid, setConfirmSid] = useState(null)
  const [confirmAll, setConfirmAll] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      setSessions(await authApi.getSessions())
    } catch (err) {
      showToast(err?.message || 'Could not load active sessions', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    load(true)
  }

  const handleRevoke = async (sid) => {
    const isCurrent = sessions.some((s) => s.sid === sid && s.current)
    setBusySid(sid)
    try {
      await authApi.revokeSession(sid)
      if (isCurrent) {
        showToast('Signed out on this device', 'success')
        setTimeout(() => logout(), 350)
        return
      }
      showToast('Signed out on that device', 'success')
      setSessions((prev) => prev.filter((s) => s.sid !== sid))
    } catch (err) {
      showToast(err?.message || 'Could not sign out that device', 'error')
    } finally {
      setBusySid(null)
      setConfirmSid(null)
    }
  }

  const handleRevokeOthers = async () => {
    setRefreshing(true)
    setConfirmAll(false)
    try {
      await authApi.revokeOtherSessions()
      showToast('Signed out on all other devices', 'success')
      await load(true)
    } catch (err) {
      showToast(err?.message || 'Could not sign out other devices', 'error')
      setRefreshing(false)
    }
  }

  const current = sessions.find((s) => s.current)
  const others = sessions.filter((s) => !s.current)

  return (
    <div className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-ink leading-snug">Active Devices &amp; Sessions</h3>
            {!loading && sessions.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                {sessions.length}
              </span>
            )}
          </div>
          <p className="text-[13px] text-muted mt-1 leading-snug">
            Every device signed into this account. Sign out any device from here.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {others.length > 0 && (
            <button
              type="button"
              disabled={refreshing || confirmAll}
              onClick={confirmAll ? handleRevokeOthers : () => setConfirmAll(true)}
              onMouseLeave={() => setConfirmAll(false)}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none ${
                confirmAll
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              {confirmAll ? 'Tap again to confirm' : 'Sign out other devices'}
            </button>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-page disabled:opacity-60 shrink-0"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
            </svg>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="divide-y divide-line">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/3 bg-gray-100 rounded-full" />
                <div className="h-2.5 w-1/2 bg-gray-100 rounded-full" />
              </div>
              <div className="h-8 w-20 bg-gray-100 rounded-full" />
            </div>
          ))
        ) : sessions.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted">No active devices found.</div>
        ) : (
          [current, ...others]
            .filter(Boolean)
            .map((s) => {
              const isCurrent = Boolean(s.current)
              const confirming = confirmSid === s.sid
              const busy = busySid === s.sid
              return (
                <div key={s.sid} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCurrent ? 'bg-brand-700 text-white' : 'bg-page text-ink/60'
                      }`}
                    >
                      <DeviceIcon session={s} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">
                        {s.device || s.browser || s.os || 'Unknown device'}
                        {isCurrent && <span className="text-brand-700"> · This device</span>}
                      </p>
                      <p className="text-xs text-muted mt-0.5 truncate">
                        {[s.location, s.ip].filter(Boolean).join(' · ') || 'Location unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Online
                      </span>
                    ) : (
                      <span className="text-xs text-muted whitespace-nowrap">{formatAgo(s.lastActiveAt)}</span>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onMouseLeave={() => confirming && setConfirmSid(null)}
                      onClick={confirming ? () => handleRevoke(s.sid) : () => setConfirmSid(s.sid)}
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none ${
                        confirming
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : isCurrent
                          ? 'border border-line bg-white text-ink hover:border-rose-200 hover:text-rose-700'
                          : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {busy ? 'Signing out…' : confirming ? 'Tap again to confirm' : 'Sign out'}
                    </button>
                  </div>
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}

export default ActiveSessions