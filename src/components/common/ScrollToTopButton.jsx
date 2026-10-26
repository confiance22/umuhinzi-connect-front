import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

/**
 * ScrollToTopButton
 * 
 * Appears dynamically when the user scrolls down on any page.
 * Displays a subtle radial progress indicator of how far the user has scrolled,
 * and smoothly scrolls the user back to the top when clicked.
 * Also handles scrolling to top on route navigation.
 */
export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const { pathname, search } = useLocation()
  const { t } = useLanguage()

  // Scroll to top automatically when navigating between pages
  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true })
    }
    window.scrollTo(0, 0)
    setIsVisible(false)
    setScrollProgress(0)
  }, [pathname, search])

  // Track scroll position & calculate scroll percentage
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY || document.documentElement.scrollTop
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight

    if (totalHeight > 0) {
      const progress = Math.min(100, Math.max(0, (currentScrollY / totalHeight) * 100))
      setScrollProgress(progress)
    } else {
      setScrollProgress(0)
    }

    // Show button once user scrolls past 240px
    setIsVisible(currentScrollY > 240)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToTop = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.1 })
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // SVG circular progress calculation
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  const label = t('common.scrollToTop') || 'Back to top'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="scroll-to-top"
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40"
        >
          <div className="relative group flex items-center justify-center">
            {/* Hover tooltip */}
            <span
              role="tooltip"
              className="pointer-events-none absolute right-full mr-3 hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-ink/90 dark:bg-white/95 text-white dark:text-ink text-xs font-medium tracking-wide shadow-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap"
            >
              {label}
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label={label}
              title={label}
              className="relative w-12 h-12 rounded-full flex items-center justify-center bg-white/90 dark:bg-[#0c1a10]/90 backdrop-blur-md border border-brand-200/80 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 shadow-[0_8px_24px_-4px_rgba(20,83,45,0.22)] dark:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)] hover:border-brand-500 hover:text-brand-800 dark:hover:text-brand-200 hover:shadow-[0_12px_28px_-4px_rgba(20,83,45,0.32)] active:scale-90 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              {/* Radial Progress SVG */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                viewBox="0 0 44 44"
              >
                {/* Background track circle */}
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  fill="transparent"
                  strokeWidth="2.5"
                  className="stroke-brand-100/80 dark:stroke-brand-950/70"
                />
                {/* Active progress stroke */}
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  fill="transparent"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="stroke-brand-600 dark:stroke-brand-400 transition-[stroke-dashoffset] duration-100 ease-out"
                />
              </svg>

              {/* Arrow Up Icon with subtle hover lift */}
              <ArrowUp className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5 group-active:translate-y-0" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
