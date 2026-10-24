/* ==========================================================================
   storage.js — defensive localStorage access
   RE must never crash because storage is unavailable, blocked, or malformed.
   ========================================================================== */

export const STORAGE_KEYS = {
  saved: 're:v1:saved',
  plans: 're:v1:plans',
  projects: 're:v1:projects',
  removals: 're:v1:removals',
  preferences: 're:v1:preferences',
}

function available() {
  try {
    const probe = '__re_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

const hasStorage = typeof window !== 'undefined' && available()

export function readJSON(key, fallback) {
  if (!hasStorage) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    // Malformed data is not a reason to break the app — fall back and move on.
    return fallback
  }
}

export function writeJSON(key, value) {
  if (!hasStorage) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota exceeded or storage disabled: the app keeps working in-memory */
  }
}

export function removeKey(key) {
  if (!hasStorage) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* nothing to do */
  }
}

export const storageAvailable = hasStorage
