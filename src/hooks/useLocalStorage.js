import { useEffect, useState } from 'react'
import { readJSON, writeJSON } from '../utils/storage'

/**
 * State that mirrors into localStorage.
 * Falls back to in-memory state when storage is unavailable or corrupt.
 */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = readJSON(key, undefined)
    return stored === undefined ? initial : stored
  })

  useEffect(() => {
    writeJSON(key, value)
  }, [key, value])

  return [value, setValue]
}
