import { IconX } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

type DialogProps = {
  children: ReactNode;
  onClose?: () => void;
  open: boolean;
  portal?: boolean;
};

export function Dialog({ children, onClose, open, portal = true }: DialogProps) {
  if (!open) return null;

  const dialog = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            type="button"
          >
            <IconX className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );

  return portal ? createPortal(dialog, document.body) : dialog;
}
