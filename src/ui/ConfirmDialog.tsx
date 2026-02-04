import { IconTrash } from '@tabler/icons-react';

import { Button } from './Button';
import { Dialog } from './Dialog';
import { DialogTitle } from './DialogTitle';

type ConfirmDialogProps = {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
};

export function ConfirmDialog({ isOpen, message, onClose, onConfirm, title }: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog onClose={onClose} open={isOpen}>
      <DialogTitle>{title}</DialogTitle>
      <p className="mb-6 text-sm text-slate-400">{message}</p>

      <div className="flex gap-3">
        <Button className="flex-1" onClick={onClose} type="button" variant="outlined">
          Cancel
        </Button>
        <Button
          color="danger"
          className="flex-1"
          iconStart={<IconTrash className="h-4 w-4" />}
          onClick={handleConfirm}
          type="button"
          variant="filled"
        >
          Delete
        </Button>
      </div>
    </Dialog>
  );
}
