/**
 * useDebounce.js — debounce a fast-changing value (e.g. a search-box query)
 * so API calls only fire after the user pauses typing.
 */
import { useState, useEffect } from 'react'

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export default useDebounce