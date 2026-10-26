import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'

const MENU_GAP = 8
const MENU_MAX_HEIGHT = 264
const VIEWPORT_PADDING = 12

const optionValue = (option) => option?.value ?? option?.code
const optionLabel = (option) => option?.label ?? option?.name

const TONES = {
  auth: {
    trigger:
      'rounded-2xl px-4 py-3.5 text-sm border-black/10 bg-black/[0.03] hover:border-brand-500/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-brand-400/40',
    triggerOpen:
      'rounded-2xl px-4 py-3.5 text-sm border-brand-600 bg-white ring-4 ring-brand-500/20 dark:border-[#16a34a]/60 dark:bg-white/10 dark:ring-[#16a34a]/30',
    triggerError: 'rounded-2xl px-4 py-3.5 text-sm border-red-500/60 dark:border-red-500/50',
    selectedText: 'text-ink dark:text-white',
    placeholderText: 'text-gray-400 dark:text-gray-500',
    chevron: 'text-gray-400 dark:text-gray-400',
    menu:
      'rounded-2xl border-black/10 bg-white p-1.5 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.45)] dark:border-white/15 dark:bg-[#0b1410] dark:shadow-[0_28px_80px_-16px_rgba(0,0,0,0.9)]',
    optionActive: 'bg-emerald-600 text-white',
    optionIdle:
      'text-ink/80 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-gray-200 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-200',
    checkActive: 'text-white',
    checkIdle: 'text-emerald-600 dark:text-emerald-400',
    empty: 'text-gray-400 dark:text-gray-500'
  },
  public: {
    trigger:
      'h-11 rounded-xl px-3.5 text-[12px] border-[#0f3d25]/[0.12] bg-[#f6f1e6]/65 text-[#13251a] hover:border-[#0f3d25]/25 dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:hover:border-white/20',
    triggerOpen:
      'h-11 rounded-xl px-3.5 text-[12px] border-[#0f3d25]/45 bg-[#fbf7ec] text-[#13251a] ring-2 ring-[#0f3d25]/10 dark:border-[#d9f99d]/40 dark:bg-white/[0.06] dark:text-white dark:ring-[#d9f99d]/10',
    triggerError: 'h-11 rounded-xl px-3.5 text-[12px] border-red-500/60 dark:border-red-500/50',
    selectedText: 'text-[#13251a] dark:text-white',
    placeholderText: 'text-[#13251a]/35 dark:text-white/30',
    chevron: 'text-[#13251a]/40 dark:text-white/35',
    menu:
      'rounded-xl border-[#0f3d25]/15 bg-[#fbf7ec] p-1 shadow-[0_24px_60px_-22px_rgba(15,61,37,0.45)] dark:border-white/15 dark:bg-[#0b1710] dark:shadow-[0_28px_80px_-16px_rgba(0,0,0,0.9)]',
    optionActive: 'bg-[#0f3d25] text-[#fbf7ec] dark:bg-[#d9f99d] dark:text-[#0f3d25]',
    optionIdle:
      'text-[#13251a]/75 hover:bg-[#0f3d25]/5 hover:text-[#0f3d25] dark:text-white/65 dark:hover:bg-white/[0.06] dark:hover:text-white',
    checkActive: 'text-[#fbf7ec] dark:text-[#0f3d25]',
    checkIdle: 'text-[#0f3d25] dark:text-[#d9f99d]',
    empty: 'text-[#13251a]/40 dark:text-white/30'
  }
}

export default function CustomSelect({
  id,
  value,
  options = [],
  onChange,
  placeholder,
  loading = false,
  loadingText,
  disabled = false,
  error,
  noOptionsText,
  tone = 'auth',
  ariaDescribedBy
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [menuStyle, setMenuStyle] = useState(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const palette = TONES[tone] || TONES.auth

  const selected = options.find((option) => optionValue(option) === value)
  const isDisabled = disabled || loading
  const displayValue = loading ? loadingText : selected ? optionLabel(selected) : placeholder

  const getMenuStyle = () => {
    if (!buttonRef.current) return null
    const rect = buttonRef.current.getBoundingClientRect()
    const desiredHeight = Math.min(
      MENU_MAX_HEIGHT,
      Math.max(options.length, 1) * 42 + 8
    )
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP - VIEWPORT_PADDING
    const spaceAbove = rect.top - MENU_GAP - VIEWPORT_PADDING
    const openUp = spaceBelow < desiredHeight && spaceAbove > spaceBelow
    const maxHeight = Math.max(64, Math.min(desiredHeight, openUp ? spaceAbove : spaceBelow))
    const top = openUp ? rect.top - maxHeight - MENU_GAP : rect.bottom + MENU_GAP

    return {
      position: 'fixed',
      left: rect.left,
      top: Math.max(VIEWPORT_PADDING, top),
      width: rect.width,
      maxHeight,
      zIndex: 100
    }
  }

  const closeMenu = () => {
    setOpen(false)
    setActiveIndex(-1)
  }

  const openMenu = () => {
    if (isDisabled) return
    const style = getMenuStyle()
    if (!style) return
    const selectedIndex = options.findIndex((option) => optionValue(option) === value)
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setMenuStyle(style)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return

    const updatePosition = () => setMenuStyle(getMenuStyle())
    const onPointerDown = (event) => {
      if (
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        closeMenu()
      }
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, options.length])

  useEffect(() => {
    if (!open) return
    const selectedIndex = options.findIndex((option) => optionValue(option) === value)
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
  }, [open, options.length, value])

  useEffect(() => {
    if (!open || activeIndex < 0) return
    menuRef.current
      ?.querySelector(`[data-option-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  const choose = (option) => {
    if (!option) return
    onChange(optionValue(option))
    closeMenu()
    buttonRef.current?.focus()
  }

  const moveActive = (direction) => {
    if (!options.length) return
    setActiveIndex((current) => {
      const start = current < 0 ? (direction > 0 ? -1 : 0) : current
      return (start + direction + options.length) % options.length
    })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      if (open) choose(options[activeIndex])
      else openMenu()
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      if (!open) openMenu()
      else moveActive(event.key === 'ArrowDown' ? 1 : -1)
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      if (!open || !options.length) return
      event.preventDefault()
      event.stopPropagation()
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1)
      return
    }

    if (event.key === 'Tab') {
      closeMenu()
      return
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      closeMenu()
    }
  }

  const triggerState = error
    ? palette.triggerError
    : open
      ? palette.triggerOpen
      : palette.trigger

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
        }
        aria-invalid={Boolean(error)}
        aria-describedby={ariaDescribedBy}
        disabled={isDisabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between gap-3 border text-left outline-none transition-all disabled:cursor-not-allowed disabled:opacity-60 ${triggerState}`}
      >
        <span
          className={`min-w-0 truncate ${
            selected && !loading ? palette.selectedText : palette.placeholderText
          }`}
        >
          {displayValue}
        </span>
        {loading ? (
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-ink/20 border-t-ink opacity-70 dark:border-white/20 dark:border-t-white" />
        ) : (
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${palette.chevron} ${
              open ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {error && (
        <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
      )}

      {open &&
        menuStyle &&
        createPortal(
          <div
            ref={menuRef}
            id={`${id}-listbox`}
            role="listbox"
            aria-labelledby={id}
            style={menuStyle}
            className={`overflow-hidden border ${palette.menu}`}
          >
            <div
              className="overflow-y-auto overscroll-contain"
              style={{ maxHeight: Math.max(48, menuStyle.maxHeight - 12) }}
            >
              {options.length === 0 ? (
                <p className={`px-3 py-3 text-sm ${palette.empty}`}>{noOptionsText}</p>
              ) : (
                options.map((option, index) => {
                  const currentValue = optionValue(option)
                  const isSelected = currentValue === value
                  const isActive = index === activeIndex
                  return (
                    <button
                      key={currentValue}
                      id={`${id}-option-${index}`}
                      data-option-index={index}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={-1}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(option)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        isActive ? palette.optionActive : palette.optionIdle
                      }`}
                    >
                      <span className="min-w-0 truncate">{optionLabel(option)}</span>
                      {isSelected && (
                        <Check
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? palette.checkActive : palette.checkIdle
                          }`}
                        />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
