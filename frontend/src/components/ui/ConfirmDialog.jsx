import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', tone = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} width="max-w-lg">
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="secondary-button px-4 py-2 text-sm font-medium">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`${tone === 'danger' ? 'danger-button' : 'primary-button'} px-4 py-2 text-sm font-semibold`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

