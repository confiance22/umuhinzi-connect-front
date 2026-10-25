/**
 * WorkerProfilePage — "My info": a worker can change their login username and
 * their 4-digit PIN. Identity fields (full name, phone, national ID, email)
 * are locked — they are tied to the stock audit trail and can only be changed
 * by the shop manager. Updates go straight to the backend (PUT /workers/me/profile,
 * POST /workers/me/pin).
 */
import React, { useState, useEffect } from 'react'
import { workerApi } from '../../../api/workerApi'
import { authApi } from '../../../api/authApi'
import { useAuth } from '../../../hooks/useAuth'
import { useToastContext } from '../../../context/ToastContext'
import UsernameField, { usernameValid } from '../../../components/common/UsernameField'

const initialsOf = (name) =>
  (name || 'Worker')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const labelClass = 'block text-sm font-bold text-ink mb-1.5'
const inputClass =
  'h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink tracking-[0.4em] text-center font-bold placeholder:text-muted/45 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors'
const cardShell = 'rounded-3xl border border-ink/[0.06] bg-card shadow-[0_1px_0_rgba(16,134,60,0.05),0_18px_44px_-28px_rgba(13,13,13,0.28)]'

export default function WorkerProfilePage() {
  const { user, setUser } = useAuth()
  const { showToast } = useToastContext()

  const [form, setForm] = useState({
    username: user?.username || '',
  })
  const [saving, setSaving] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState('idle')

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    authApi
      .getCurrentUser()
      .then((me) => {
        if (!mounted || !me) return
        setForm((f) => ({ username: f.username || me.username || '' }))
        setUser({ ...user, ...me })
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setUsername = (e) => setForm((f) => ({ ...f, username: e.target.value }))

  const usernameOk = usernameStatus === 'available' && usernameValid(String(form.username || '').trim())

  const saveProfile = async (e) => {
    e.preventDefault()
    if (form.username.trim().length < 3) {
      showToast('Username must be at least 3 characters', 'warning')
      return
    }
    setSaving(true)
    try {
      const updated = await workerApi.updateSelf({ username: form.username.trim() })
      setUser({ ...user, ...updated })
      showToast('Username updated', 'success')
    } catch (err) {
      showToast(err.message || 'Could not save your username', 'error')
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (!/^\d{4}$/.test(pw.current)) {
      showToast('Enter your current 4-digit PIN', 'warning')
      return
    }
    if (!/^\d{4}$/.test(pw.next)) {
      showToast('New PIN must be exactly 4 digits', 'warning')
      return
    }
    if (pw.next !== pw.confirm) {
      showToast('New PINs do not match', 'error')
      return
    }
    setPwSaving(true)
    try {
      await workerApi.changePin({ currentPin: pw.current, newPin: pw.next })
      showToast('PIN changed. Use your new PIN on next login.', 'success')
      setPw({ current: '', next: '', confirm: '' })
    } catch (err) {
      showToast(err?.message || 'Could not change PIN', 'error')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="space-y-4 animate-[slideUp_0.25s_ease]">
      {/* Identity card */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-7 text-center shadow-[0_24px_56px_-28px_rgba(16,134,60,0.65)]">
        <span className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-brand-500/25 blur-2xl" />
        <span className="pointer-events-none absolute -bottom-24 -left-16 w-48 h-48 rounded-full bg-brand-400/15 blur-2xl" />
        <span className="pointer-events-none absolute top-4 right-5 w-10 h-10 rounded-2xl border border-white/15 rotate-12" />
        <span className="relative inline-flex w-20 h-20 rounded-full bg-white/95 text-brand-700 text-2xl font-bold items-center justify-center mx-auto mb-3 shadow-[0_16px_36px_-16px_rgba(0,0,0,0.45)] ring-8 ring-white/15">
          {initialsOf(user?.name || user?.username)}
        </span>
        <h2 className="relative text-white text-lg font-bold">{user?.name || user?.username}</h2>
        <p className="relative text-xs text-brand-100/85 mt-1 inline-flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-300" />
          Shop worker
        </p>
      </div>

      {/* Edit details */}
      <form onSubmit={saveProfile} className={`${cardShell} p-5 space-y-4`}>
        <div>
          <h3 className="text-sm font-bold text-ink">Your details</h3>
          <p className="text-xs text-muted mt-0.5">Username is the only detail you can change yourself.</p>
        </div>

        {/* Locked identity fields — tied to the audit trail */}
        <div className="rounded-2xl border border-line divide-y divide-line bg-white">
          {[
            ['Full name', user?.name || '—'],
            ['Phone number', user?.phone || '—'],
            ['Email', user?.email || '—'],
            ['National ID', user?.nationalId || '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">{label}</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-ink truncate">{value}</span>
                <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted -mt-1">
          These are locked because every stock movement you record is traced to the name and ID on record.
          Ask your shop manager to update them.
        </p>

        <div>
          <UsernameField
            value={form.username}
            onChange={setUsername}
            currentUsername={user?.username}
            excludeId={user?.id}
            label="Username"
            placeholder="username"
            onStatusChange={setUsernameStatus}
          />
        </div>

        <button
          type="submit"
          disabled={saving || !usernameOk}
          className="w-full py-4 rounded-full bg-gradient-to-t from-brand-800 to-brand-600 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-[0_14px_34px_-14px_rgba(16,134,60,0.75),inset_0_1px_0_rgba(255,255,255,0.22)] transition-[transform,filter] duration-150 hover:brightness-105 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
        >
          {saving ? 'Saving…' : 'Save username'}
        </button>
      </form>

      {/* Login PIN */}
      <form onSubmit={savePassword} className={`${cardShell} p-5 space-y-4`}>
        <div>
          <h3 className="text-sm font-bold text-ink">Change login PIN</h3>
          <p className="text-xs text-muted mt-0.5">Your PIN is the 4 digits you memorise and type at login.</p>
        </div>
        <div>
          <label className={labelClass}>Current PIN</label>
          <input
            className={inputClass}
            value={pw.current}
            onChange={(e) => setPw((p) => ({ ...p, current: e.target.value.replace(/\D/g, '') }))}
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
          />
        </div>
        <div>
          <label className={labelClass}>New PIN</label>
          <input
            className={inputClass}
            value={pw.next}
            onChange={(e) => setPw((p) => ({ ...p, next: e.target.value.replace(/\D/g, '') }))}
            inputMode="numeric"
            maxLength={4}
            placeholder="4 new digits"
          />
        </div>
        <div>
          <label className={labelClass}>Confirm new PIN</label>
          <input
            className={inputClass}
            value={pw.confirm}
            onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value.replace(/\D/g, '') }))}
            inputMode="numeric"
            maxLength={4}
            placeholder="Same as above"
          />
        </div>
        <button
          type="submit"
          disabled={pwSaving}
          className="w-full py-4 rounded-full bg-white text-ink border border-ink/10 text-sm font-bold inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_-16px_rgba(13,13,13,0.5)] transition-[transform,background-color,color] duration-150 hover:bg-page active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
        >
          {pwSaving ? 'Updating…' : 'Change PIN'}
        </button>
      </form>
    </div>
  )
}