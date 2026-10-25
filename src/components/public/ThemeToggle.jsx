import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t('common.toggleTheme')}
      title={isDark ? t('theme.light') : t('theme.dark')}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70 text-ink/70 transition-colors hover:border-brand-500/40 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-brand-400/40 dark:hover:text-brand-300 ${className}`}
    >
      <span className="relative flex size-4 items-center justify-center">
        <Sun
          className={`absolute size-4 transition-all duration-300 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
        <Moon
          className={`absolute size-4 transition-all duration-300 ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </span>
    </button>
  )
}
