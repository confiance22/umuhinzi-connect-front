import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import EarthIcon from './EarthIcon'

const options = [
  { code: 'en', label: 'lang.enName' },
  { code: 'rw', label: 'lang.rwName' }
]

export default function LanguageToggle({ className = '' }) {
  const { lang, setLang, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t('common.toggleLanguage')}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t('common.toggleLanguage')}
        className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70 text-ink/70 transition-colors hover:border-brand-500/40 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-brand-400/40 dark:hover:text-brand-300 ${className}`}
      >
        <EarthIcon className="size-[19px]" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('common.toggleLanguage')}
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-black/10 bg-white p-1.5 shadow-[0_16px_40px_-24px_rgba(5,46,22,0.45)] dark:border-white/10 dark:bg-[#0b1710] dark:shadow-black/50"
        >
          {options.map((option) => {
            const active = lang === option.code
            return (
              <button
                key={option.code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setLang(option.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'text-ink/70 hover:bg-black/[0.04] hover:text-ink dark:text-white/65 dark:hover:bg-white/[0.06] dark:hover:text-white'
                }`}
              >
                <span>{t(option.label)}</span>
                {active && <Check className="size-3.5 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
