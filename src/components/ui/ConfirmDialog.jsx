import { Modal } from './Modal'

/** Small confirmation dialog used for destructive demo actions. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            {cancelLabel}
          </button>
          <span className="spacer" style={{ flex: 1 }} />
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn--primary' : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>{children}</div>
    </Modal>
  )
}
