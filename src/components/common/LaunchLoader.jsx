/**
 * LaunchLoader — StockRwa launch splash.
 *
 * The dark panels ARE the ground: the logo lockup rises in with a slogan, a
 * hairline fills like a progress bar, then the exit is a curtain — two panels
 * split apart to reveal the page rather than a fade over the top of it.
 *
 * Small by design, no dependencies. rAF drives the fill; wall-clock fail-safe
 * timers guarantee the exit even if the page stops compositing (background
 * tabs, etc.), so body scroll is always released.
 *
 * Timing: HOLD (1150ms), then the stage clears in 0.3s while the panels wait
 * 0.1s and travel for 0.72s. `exit` (860ms) must stay ≥ that total or the
 * component unmounts mid-slide and the curtain snaps away.
 */
import React, { useEffect, useRef, useState } from 'react'
import logo from '../../assets/logo/stockrwa-logo.png'

const HOLD = 1150

const LaunchLoader = ({ onDone }) => {
  const [pct, setPct] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const done = useRef(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const span = reduced ? 320 : HOLD
    const exit = reduced ? 60 : 860
    const t0 = performance.now()
    let raf
    let exitTimer

    const finish = () => {
      if (done.current) return
      done.current = true
      onDone?.()
    }
    const leave = () => {
      setLeaving(true)
      clearTimeout(exitTimer)
      exitTimer = setTimeout(finish, exit)
    }
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / span)
      setPct(p)
      if (p < 1) {
        raf = requestAnimationFrame(tick)
        return
      }
      leave()
    }
    raf = requestAnimationFrame(tick)

    /* rAF is suspended off-screen; these guarantees the exit regardless. */
    const failsafe = setTimeout(leave, span + 150)
    const hardStop = setTimeout(finish, span + exit + 700)

    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(failsafe)
      clearTimeout(hardStop)
      clearTimeout(exitTimer)
      document.body.style.overflow = ''
    }
  }, [onDone])

  return (
    <div className={`sl ${leaving ? 'sl--out' : ''}`} role="status" aria-live="polite" aria-label="Loading StockRwa">
      {/* The curtain — two panels split apart to reveal the page. 50.5% each so
          they overlap on the seam and no hairline of the page shows through
          before they move. */}
      <div className="sl-panel sl-panel--t" aria-hidden="true" />
      <div className="sl-panel sl-panel--b" aria-hidden="true" />

      <div className="sl-stage">
        <div className="sl-lockup">
          <img src={logo} alt="StockRwa logo" />
          <span>StockRwa</span>
        </div>

        <p className="sl-slogan">Every item counted. Every worker accountable.</p>

        <div className="sl-rule" aria-hidden="true">
          <span className="sl-fill" style={{ transform: `scaleX(${pct})` }} />
        </div>
      </div>
    </div>
  )
}

export default LaunchLoader