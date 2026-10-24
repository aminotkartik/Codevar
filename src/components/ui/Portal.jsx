import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Portal — renders overlays into document.body so that page-level stacking
 * contexts (sticky headers, route transitions, animated panels) can never
 * paint above a dock, composer, dialog or toast.
 */
export function Portal({ children }) {
  const [host, setHost] = useState(null)

  useEffect(() => {
    setHost(document.body)
  }, [])

  if (!host) return null
  return createPortal(children, host)
}
