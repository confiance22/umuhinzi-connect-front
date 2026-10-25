/**
 * StockContext — global stock state.
 * Current stock levels, recent movements, and the active stock-check/audit
 * session. Every movement is recorded with the logged-in actor id so the
 * audit trail ("who moved/removed stock") is preserved even client-side.
 */
import React, { createContext, useContext, useState } from 'react'

export const StockContext = createContext({
  levels: [],
  movements: [],
  activeCheck: null,
  loading: false,
  error: null,
  recordMovement: () => {},
  startStockCheck: () => {},
  submitStockCheck: () => {},
})

export function StockProvider({ children }) {
  const [levels, setLevels] = useState([])
  const [movements, setMovements] = useState([])
  const [activeCheck, setActiveCheck] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // TODO(implementation): wire to stockApi (getLevels/getMovements/record
  // stock-in/out/start+submit stock check). Movement payloads must include
  // actorId, productId, quantity and reason/note.

  const value = {
    levels,
    movements,
    activeCheck,
    loading,
    error,
    recordMovement: () => {},
    startStockCheck: () => {},
    submitStockCheck: () => {},
  }

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>
}

export function useStockContext() {
  return useContext(StockContext)
}