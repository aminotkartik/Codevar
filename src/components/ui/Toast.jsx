import { useEffect } from 'react'
import { useRE } from '../../context/REContext'
import { Check, Info, Close } from './Icons'

/**
 * Toast viewport — brief notifications with a polite live region so screen
 * readers announce the outcome of an action.
 */
export function ToastViewport() {
  const { toasts, dismissToast } = useRE()

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 3600),
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [toasts, dismissToast])

  if (toasts.length === 0) return null

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div className="toast" key={toast.id}>
          <span className="toast__icon">
            {toast.tone === 'warning' ? (
              <Info width={16} height={16} />
            ) : (
              <Check width={16} height={16} />
            )}
          </span>
          <span className="toast__text">{toast.text}</span>
          <button
            type="button"
            className="icon-btn icon-btn--sm"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            style={{ color: 'inherit' }}
          >
            <Close width={14} height={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
