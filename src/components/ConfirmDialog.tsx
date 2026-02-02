import { IconTrash } from '@tabler/icons-react';

import { Button } from './Button';

type ConfirmDialogProps = {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
};

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="mb-3 text-xl font-semibold text-slate-100">{title}</h2>
        <p className="mb-6 text-sm text-slate-400">{message}</p>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={onClose} type="button" variant="outlined">
            Cancel
          </Button>
          <Button
            color="danger"
            className="flex-1"
            iconStart={<IconTrash className="w-4 h-4" />}
            onClick={handleConfirm}
            type="button"
            variant="filled"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
