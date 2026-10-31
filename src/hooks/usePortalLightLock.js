import { useLayoutEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

/**
 * Portals render with a fixed warm/beige palette and must ignore the
 * app-wide dark/light theme. While mounted this forces the document into
 * light mode and immediately undoes any dark class added from elsewhere
 * (theme toggle, storage events, etc.). The previous theme is restored on
 * unmount.
 */
export const usePortalLightLock = () => {
  const { theme } = useTheme()
  const themeRef = useRef(theme)

  useLayoutEffect(() => {
    themeRef.current = theme
  }, [theme])

  useLayoutEffect(() => {
    const root = document.documentElement

    const lockLight = () => {
      if (root.classList.contains('dark')) root.classList.remove('dark')
      if (root.style.colorScheme !== 'light') root.style.colorScheme = 'light'
    }

    lockLight()
    const observer = new MutationObserver(lockLight)
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'style'] })

    return () => {
      observer.disconnect()
      root.classList.toggle('dark', themeRef.current === 'dark')
      root.style.colorScheme = themeRef.current
    }
  }, [])
}

export default usePortalLightLock
