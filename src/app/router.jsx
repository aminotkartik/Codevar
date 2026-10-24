import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * A small history-API router. Supports direct URLs, refresh, and back/forward
 * without pulling in a routing dependency.
 */

const RouterContext = createContext(null)

export function parseParams(search) {
  return new URLSearchParams(search || '')
}

export function RouterProvider({ children }) {
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }))

  const sync = useCallback(() => {
    setLocation({ pathname: window.location.pathname, search: window.location.search })
  }, [])

  useEffect(() => {
    const onPop = () => {
      sync()
      if (!window.location.hash) window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [sync])

  const navigate = useCallback(
    (to, { replace = false } = {}) => {
      const target = to.startsWith('/') ? to : `/${to}`
      const current = `${window.location.pathname}${window.location.search}`
      if (target === current) {
        sync()
        return
      }
      if (replace) window.history.replaceState({}, '', target)
      else window.history.pushState({}, '', target)
      sync()
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    },
    [sync],
  )

  const value = useMemo(
    () => ({ ...location, params: parseParams(location.search), navigate }),
    [location, navigate],
  )

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used inside <RouterProvider>')
  return ctx
}

/** Anchor that routes internally but behaves like a normal link otherwise. */
export function Link({ to, children, onClick, ...rest }) {
  const { navigate } = useRouter()

  const handleClick = (event) => {
    if (onClick) onClick(event)
    if (event.defaultPrevented) return
    if (event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (rest.target === '_blank' || rest.rel === 'external') return
    if (event.currentTarget.getAttribute('download')) return
    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}

export function matchRoute(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'

  if (path === '/') return { name: 'home', params: {} }
  if (path === '/explore') return { name: 'explore', params: {} }
  if (path === '/desk') return { name: 'desk', params: {} }
  if (path === '/submit') return { name: 'submit', params: {} }

  const projectMatch = /^\/projects\/([^/]+)$/.exec(path)
  if (projectMatch) return { name: 'project', params: { slug: projectMatch[1] } }

  return { name: 'notfound', params: {} }
}
