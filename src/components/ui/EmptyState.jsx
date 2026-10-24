export function EmptyState({ title, text, action, children }) {
  return (
    <div className="empty-state">
      <h3 className="empty-state__title">{title}</h3>
      {text && <p className="empty-state__text">{text}</p>}
      {action && <div className="empty-state__actions">{action}</div>}
      {children}
    </div>
  )
}
