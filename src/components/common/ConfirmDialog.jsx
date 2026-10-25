/**
 * ConfirmDialog — modal confirmation for destructive/irreversible actions
 * (delete product, deactivate worker). Always states what happens AND that the
 * action is recorded against the logged-in user (audit-trail supportive).
 */
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">{message}</p>
    </Modal>
  )
}