/**
 * Toast — oval pill notifications (custom, hand-crafted look).
 * A soft dark capsule seated at the bottom-center with a cozy drop shadow,
 * tiny accent dot, and a calm slide-up entrance — nothing like the stock
 * top-right "AI" cards with left-border bars and bouncy springs.
 */
import { motion, AnimatePresence } from 'framer-motion'

const ACCENT = {
  success: {
    bubble: 'bg-brand-600',
    glow: '#10863c',
    icon: (
      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
  },
  error: {
    bubble: 'bg-rose-500',
    glow: '#f43f5e',
    icon: (
      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    ),
  },
  warning: {
    bubble: 'bg-amber-400',
    glow: '#fbbf24',
    icon: (
      <svg className="w-2.5 h-2.5 text-ink" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 6a1 1 0 01.94.66l5.9 16.2a1 1 0 01-1.87.7L12 8.5l-4.97 15a1 1 0 01-1.87-.7l5.9-16.2A1 1 0 0112 6z" transform="scale(0.6) translate(8 1)" />
      </svg>
    ),
  },
  info: {
    bubble: 'bg-white/15',
    glow: '#ffffff',
    icon: (
      <svg className="w-2.5 h-2.5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M12 7h.01M12 11v6" />
      </svg>
    ),
  },
}

export default function Toast({ toasts = [], onDismiss }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse items-center gap-2.5 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const accent = ACCENT[t.type] || ACCENT.info
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.26 }}
              role="status"
              className="relative pointer-events-auto flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-ink/[0.92] backdrop-blur-md border border-white/10"
              style={{ boxShadow: `0 10px 34px -6px ${accent.glow}55, 0 8px 24px rgba(0,0,0,0.35)` }}
            >
              {/* soft inner sheen so it reads like glass, not a flat chip */}
              <span className="absolute inset-y-0 left-3 right-3 rounded-full bg-gradient-to-b from-white/[0.09] to-transparent pointer-events-none" />

              <span className={`relative shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${accent.bubble}`}>
                {accent.icon}
              </span>

              <span className="relative text-xs font-medium tracking-wide text-white/90 leading-snug max-w-[360px]">
                {t.message}
              </span>

              {onDismiss && (
                <button
                  onClick={() => onDismiss(t.id)}
                  className="relative shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close notification"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}