import { IconX } from '@tabler/icons-react';
import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { DialogTitle } from './DialogTitle';

type DialogProps = {
  children: ReactNode;
  header?: ReactNode;
  onClose?: () => void;
  open: boolean;
  portal?: boolean;
  title: string;
};

export function Dialog({ children, header, onClose, open, portal = true, title }: DialogProps) {
  useEffect(() => {
    if (!open || !onClose) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-labelledby="title"
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            type="button"
          >
            <IconX className="h-5 w-5" />
          </button>
        )}
        {header}
        <DialogTitle id="title">{title}</DialogTitle>
        {children}
      </div>
    </div>
  );

  return portal ? createPortal(dialog, document.body) : dialog;
}
