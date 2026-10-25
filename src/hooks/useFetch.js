/**
 * useFetch.js — generic data-fetching hook for GET resources.
 * Returns { data, loading, error, refetch }. Wire to the api/* modules once
 * endpoints are live; keeps loading/error handling consistent across pages.
 */
import { useState, useEffect } from 'react'

export function useFetch(fetcher) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refetch = () => {
    // TODO(implementation): call fetcher(), setData / setError / setLoading.
  }

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, error, refetch }
}

export default useFetch