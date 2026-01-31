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
          <Button
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
            onClick={onClose}
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
            onClick={handleConfirm}
            type="button"
            variant="ghost"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
