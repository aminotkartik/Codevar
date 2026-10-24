import { useEffect, useRef } from 'react'

/**
 * usePointerTilt — the paper reacts to the cursor.
 *
 * Cards pick up an imperceptible tilt toward the pointer and a soft raking
 * light across the sheet. It is decoration only: no DOM structure changes, no
 * listeners on touch devices, no motion for visitors who asked for none.
 */
export function usePointerTilt({ max = 2.6 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    if (typeof window.matchMedia !== 'function') return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (reduced.matches || !fine.matches) return undefined

    let frame = 0
    let last = null

    const apply = () => {
      frame = 0
      if (!last) return
      const { x, y } = last
      node.style.setProperty('--tilt-y', `${((x - 0.5) * max).toFixed(2)}deg`)
      node.style.setProperty('--tilt-x', `${((0.5 - y) * max).toFixed(2)}deg`)
      node.style.setProperty('--glow-x', `${(x * 100).toFixed(1)}%`)
      node.style.setProperty('--glow-y', `${(y * 100).toFixed(1)}%`)
    }

    const onMove = (event) => {
      const rect = node.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      last = {
        x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
      }
      node.dataset.pointer = 'true'
      if (!frame) frame = window.requestAnimationFrame(apply)
    }

    const onLeave = () => {
      last = null
      if (frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
      delete node.dataset.pointer
      node.style.removeProperty('--tilt-x')
      node.style.removeProperty('--tilt-y')
      node.style.removeProperty('--glow-x')
      node.style.removeProperty('--glow-y')
    }

    node.addEventListener('pointermove', onMove, { passive: true })
    node.addEventListener('pointerleave', onLeave, { passive: true })
    node.addEventListener('pointercancel', onLeave, { passive: true })

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
      node.removeEventListener('pointercancel', onLeave)
    }
  }, [max])

  return ref
}
