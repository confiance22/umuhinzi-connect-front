import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from '../i18n/translations'

const LANGUAGE_KEY = 'umuhinzi_lang'
const LanguageContext = createContext(null)

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en'
  try {
    return window.localStorage.getItem(LANGUAGE_KEY) === 'rw' ? 'rw' : 'en'
  } catch {
    return 'en'
  }
}

const resolveKey = (dictionary, key) =>
  key.split('.').reduce((value, part) => (value == null ? undefined : value[part]), dictionary)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = lang === 'rw' ? 'rw' : 'en'
    try {
      window.localStorage.setItem(LANGUAGE_KEY, lang)
    } catch {
      // Ignore storage failures; the in-memory language still works.
    }
  }, [lang])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === LANGUAGE_KEY && (event.newValue === 'en' || event.newValue === 'rw')) {
        setLang(event.newValue)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const t = useCallback(
    (key) => {
      const value = resolveKey(translations[lang], key)
      if (value !== undefined) return value
      const fallback = resolveKey(translations.en, key)
      return fallback !== undefined ? fallback : key
    },
    [lang]
  )

  const toggleLang = useCallback(() => {
    setLang((current) => (current === 'en' ? 'rw' : 'en'))
  }, [])

  const value = useMemo(
    () => ({ lang, isRw: lang === 'rw', setLang, toggleLang, t }),
    [lang, t, toggleLang]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
