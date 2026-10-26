import { useEffect } from 'react'
import Lenis from 'lenis'

export default function LenisScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      anchors: {
        offset: -100
      }
    })

    window.__lenis = lenis

    const raf = (time) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      if (window.__lenis === lenis) {
        delete window.__lenis
      }
      lenis.destroy()
    }
  }, [])

  return null
}
