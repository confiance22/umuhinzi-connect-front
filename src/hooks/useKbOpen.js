/* useKbOpen — detects whether the on-screen keyboard should be treated as
   open. The primary signal is INPUT FOCUS: on many (older) Samsung engines
   the amount of resized viewport is hidden (`resizes-content` behaviour
   shrinks both innerHeight and visualViewport together, so the classic
   `innerHeight - vv.height` diff reads ~0 while the keyboard IS up). That
   caused the bottom nav pill to stay visible beneath the composer, leaving a
   white band above the keyboard. Focus never lies, so once a field is focused
   we consider the keyboard open and only close when the field blurs (never
   letting a bad viewport measurement "un-open" mid-typing). */
import { useEffect, useState } from 'react'

export default function useKbOpen() {
  const [open, setOpen] = useState(
    () =>
      typeof window !== 'undefined' &&
      !!document.activeElement &&
      isField(document.activeElement),
  )

  useEffect(() => {
    const measure = () => {
      const vv = window.visualViewport
      if (vv) return Math.round(window.innerHeight - vv.height) > 120
      return false
    }
    const sync = () => setOpen(isField(document.activeElement) || measure())
    const onFocusIn = (e) => {
      if (isField(e.target)) setOpen(true)
    }
    const onFocusOut = () => setOpen(isField(document.activeElement) || measure())

    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', sync)
      vv.addEventListener('scroll', sync)
    }
    window.addEventListener('resize', sync)
    window.addEventListener('focusin', onFocusIn)
    window.addEventListener('focusout', onFocusOut)

    return () => {
      if (vv) {
        vv.removeEventListener('resize', sync)
        vv.removeEventListener('scroll', sync)
      }
      window.removeEventListener('resize', sync)
      window.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  return open
}

function isField(t) {
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
}