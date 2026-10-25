import { Languages } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function LanguageToggle({ className = '' }) {
  const { lang, toggleLang, t } = useLanguage()

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={t('common.toggleLanguage')}
      title={t('common.toggleLanguage')}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-2.5 text-[11px] font-semibold tracking-wide text-ink/70 transition-colors hover:border-brand-500/40 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-brand-400/40 dark:hover:text-brand-300 ${className}`}
    >
      <Languages className="size-3.5" />
      <span>{lang === 'en' ? t('lang.en') : t('lang.rw')}</span>
    </button>
  )
}
