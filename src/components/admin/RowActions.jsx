/**
 * RowActions — action dock + ellipsis menu used in admin/member tables.
 * Ported from the Soma Connect admin RowActions, re-skinned for StockRwa.
 */
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const ACTION_TONES = {
  ink: 'hover:text-ink hover:bg-[#d9f99d]/10',
  amber: 'hover:text-amber-600 hover:bg-amber-50',
  emerald: 'hover:text-emerald-600 hover:bg-emerald-50',
  gray: 'hover:text-ink/70 hover:bg-ink/[0.06]',
  rose: 'hover:text-rose-600 hover:bg-rose-50',
}

export const ActionButton = ({ label, tone = 'ink', onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`group/act relative w-8 h-8 rounded-lg flex items-center justify-center text-ink/40 transition-all duration-150 active:scale-90 ${ACTION_TONES[tone]}`}
  >
    {children}
    <span className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover/act:opacity-100 group-hover/act:translate-y-0 transition-all duration-150 z-20 shadow-lg">
      {label}
    </span>
  </button>
)

export const ActionDock = ({ children }) => (
  <div className="inline-flex items-center gap-0.5 rounded-xl border border-line bg-[#efe7d6] shadow-sm p-0.5">
    {children}
  </div>
)

export const ActionDivider = () => <span className="w-px h-4 bg-ink/10 mx-0.5" />

export const RowActionMenu = ({ primary, items = [] }) => {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const controlRef = useRef(null)
  const menuRef = useRef(null)
  const MENU_WIDTH = 220

  const close = () => setOpen(false)

  const positionMenu = () => {
    if (!controlRef.current) return
    const rect = controlRef.current.getBoundingClientRect()
    const menuHeight = menuRef.current?.offsetHeight || 160
    const viewportPadding = 8
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Compute left within viewport bounds
    let left = rect.left
    if (left + MENU_WIDTH > viewportWidth - viewportPadding) {
      left = Math.max(viewportPadding, rect.right - MENU_WIDTH)
    }
    if (left < viewportPadding) {
      left = viewportPadding
    }

    // Determine whether to open downward or upward
    const fitsBelow = rect.bottom + menuHeight + viewportPadding <= viewportHeight
    const fitsAbove = rect.top - menuHeight - viewportPadding >= 0
    const openUpward = !fitsBelow && fitsAbove

    const top = openUpward
      ? Math.max(viewportPadding, rect.top - menuHeight - 6)
      : Math.min(viewportHeight - menuHeight - viewportPadding, rect.bottom + 6)

    setCoords({ top, left })
  }

  const toggle = (e) => {
    e?.stopPropagation?.()
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
  }

  useLayoutEffect(() => {
    if (open) positionMenu()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (controlRef.current?.contains(e.target)) return
      if (menuRef.current?.contains(e.target)) return
      close()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    const onReposition = () => positionMenu()

    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  const normalizedItems = (() => {
    const list = [...items]
    if (!primary) return list
    const alreadyHasPrimary = list.some(
      (item) => item !== 'divider' && item.label?.toLowerCase() === primary.label?.toLowerCase()
    )
    if (alreadyHasPrimary) return list
    return [{ label: primary.label, icon: primary.icon, onClick: primary.onClick }, ...list]
  })()

  return (
    <>
      <div ref={controlRef} className="inline-flex items-stretch rounded-full overflow-hidden">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className={`inline-flex items-center justify-center gap-2 pl-3.5 pr-3 h-8 text-sm font-medium rounded-full transition-[transform,background-color,color] duration-150 active:scale-[0.98] ${
            open ? 'bg-[#c3f27f] text-[#0f3d25]' : 'bg-[#d9f99d] text-[#0f3d25] hover:bg-[#c3f27f]'
          }`}
        >
          <span>Actions</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180 text-white' : 'text-white/80'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: coords.top, left: coords.left, position: 'fixed' }}
            className="w-[220px] bg-[#fbf7ec] border border-line rounded-2xl shadow-xl py-1.5 z-[99999] animate-[fadeIn_0.15s_ease]"
          >
            {normalizedItems.map((item, i) =>
              item === 'divider' ? (
                <div key={`div-${i}`} className="my-1 border-t border-line" />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  disabled={item.disabled}
                  title={item.title}
                  onClick={() => {
                    close()
                    item.onClick?.()
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition-colors ${
                    item.disabled
                      ? 'text-ink/35 cursor-not-allowed'
                      : item.danger
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-ink/75 hover:bg-page hover:text-ink'
                  }`}
                >
                  <span className={`[&>svg]:w-4 [&>svg]:h-4 ${item.disabled ? 'text-ink/30' : item.danger ? 'text-rose-500' : item.iconTone || 'text-ink/45'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  )
}

export const DockIcons = {
  edit: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  qr: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h.01M18 14h.01M14 18h.01M18 18h.01M14 21v.01M18 21h.01" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </svg>
  ),
  x: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  lock: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  unlock: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  power: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  ),
  shield: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
}