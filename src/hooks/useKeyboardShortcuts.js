import { useEffect, useRef, useState } from 'react'
import { useRouter } from '../app/router'

/**
 * useKeyboardShortcuts — the keyboard half of the canvas.
 *
 * Navigation and focus only. Nothing here can mutate a record: the chords
 * route, the walker moves focus between cards, and the sheet explains the
 * drag keys that already exist. Every handler bails out while the visitor is
 * typing, so search fields behave like search fields.
 */

const CHORD_WINDOW = 1400

const CHORDS = {
  h: '/',
  e: '/explore',
  d: '/desk',
  s: '/submit',
  r: '/desk?tab=removed',
}

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isTyping(target) {
  if (!target || typeof target.tagName !== 'string') return false
  return EDITABLE_TAGS.has(target.tagName) || target.isContentEditable === true
}

function focusableIn(card) {
  return card?.querySelector('.drag-grip, a[href], button:not([disabled])') || null
}

function cardLabel(card) {
  const title = card?.querySelector('h3, h2')
  return (title?.textContent || card?.getAttribute('aria-label') || '').trim()
}

export function useKeyboardShortcuts({ onOpenShortcuts, announce } = {}) {
  const { navigate } = useRouter()
  const [armed, setArmed] = useState(false)
  const chord = useRef({ key: null, at: 0 })
  const resetTimer = useRef(0)

  useEffect(() => {
    const disarmed = () => {
      chord.current = { key: null, at: 0 }
      setArmed(false)
    }

    const arm = (key) => {
      chord.current = { key, at: Date.now() }
      setArmed(true)
      window.clearTimeout(resetTimer.current)
      resetTimer.current = window.setTimeout(disarmed, CHORD_WINDOW)
    }

    const onKeyDown = (event) => {
      if (event.defaultPrevented) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 'Escape') {
        disarmed()
        return
      }
      // Typing is typing. The only exception is Escape, handled above.
      if (isTyping(event.target)) return

      const key = event.key
      const lower = key.toLowerCase()

      // ---- g-chords: navigate ------------------------------------------
      if (chord.current.key === 'g' && Date.now() - chord.current.at < CHORD_WINDOW) {
        const target = CHORDS[lower]
        if (target) {
          event.preventDefault()
          disarmed()
          navigate(target)
          announce?.(`Moved to ${target === '/' ? 'home' : target.replace('/', '').split('?')[0]} by keyboard.`)
          return
        }
        disarmed()
      }

      if (lower === 'g' && !event.shiftKey) {
        arm('g')
        return
      }

      if (key === '?') {
        event.preventDefault()
        disarmed()
        onOpenShortcuts?.()
        return
      }

      // ---- / : jump to search ------------------------------------------
      if (key === '/') {
        event.preventDefault()
        disarmed()
        const input = document.getElementById('explore-search')
        if (input) {
          input.focus({ preventScroll: true })
          input.select?.()
          announce?.('Search field focused.')
          return
        }
        navigate('/explore')
        // The input mounts with the route; keep trying briefly rather than
        // guessing a timeout.
        let tries = 0
        const seek = () => {
          const field = document.getElementById('explore-search')
          if (field) {
            field.focus({ preventScroll: true })
            field.select?.()
            announce?.('Search field focused.')
            return
          }
          tries += 1
          if (tries < 30) window.requestAnimationFrame(seek)
        }
        window.requestAnimationFrame(seek)
        return
      }

      // ---- j / k : walk the cards --------------------------------------
      if (lower === 'j' || lower === 'k') {
        const cards = Array.from(document.querySelectorAll('.data-card')).filter(
          (card) => card.getAttribute('data-draggable') !== 'false' || focusableIn(card),
        )
        if (cards.length === 0) return
        event.preventDefault()
        const current = document.activeElement?.closest?.('.data-card') || null
        const index = current ? cards.indexOf(current) : -1
        let next
        if (index === -1) next = lower === 'j' ? 0 : cards.length - 1
        else if (lower === 'j') next = Math.min(cards.length - 1, index + 1)
        else next = Math.max(0, index - 1)
        const card = cards[next]
        const target = focusableIn(card)
        target?.focus({ preventScroll: false })
        card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        announce?.(`Card ${next + 1} of ${cards.length}${cardLabel(card) ? `: ${cardLabel(card)}` : ''}.`)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(resetTimer.current)
    }
  }, [announce, navigate, onOpenShortcuts])

  return { armed, chordKey: armed ? 'g' : null }
}

export const SHORTCUT_GROUPS = [
  {
    id: 'navigate',
    title: 'Go anywhere',
    items: [
      { keys: ['g', 'h'], label: 'Home' },
      { keys: ['g', 'e'], label: 'Explore the archive' },
      { keys: ['g', 'd'], label: 'Revival Desk' },
      { keys: ['g', 's'], label: 'Submit a project' },
      { keys: ['g', 'r'], label: 'Recently removed' },
    ],
  },
  {
    id: 'canvas',
    title: 'Work the canvas',
    items: [
      { keys: ['Space'], label: 'Lift the focused card' },
      { keys: ['↑', '↓', '←', '→'], label: 'Choose an Action Zone' },
      { keys: ['Space'], label: 'Drop it — this is the only way to commit' },
      { keys: ['Esc'], label: 'Put the card back' },
    ],
  },
  {
    id: 'find',
    title: 'Find and move',
    items: [
      { keys: ['/'], label: 'Jump to search' },
      { keys: ['j'], label: 'Next card' },
      { keys: ['k'], label: 'Previous card' },
      { keys: ['Tab'], label: 'Move through the page' },
      { keys: ['?'], label: 'This list' },
    ],
  },
]
