import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import type { CueEvent } from '../../../types';

type CueMenuProps = {
  cues: CueEvent[];
  onClose: () => void;
  onSelect: (cue: CueEvent) => void;
};

export const CueMenu: FC<CueMenuProps> = ({ cues, onClose, onSelect }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      aria-label="Start from cue"
      className="absolute top-full left-0 z-60 mt-2 max-h-72 w-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-lg"
      role="menu"
    >
      {cues.map((cue) => (
        <button
          key={cue.id}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-slate-100 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
          onClick={() => onSelect(cue)}
          role="menuitem"
          type="button"
        >
          <span className="shrink-0 text-xs font-medium text-slate-400">
            M{cue.measure}:B{cue.beat}
          </span>
          <span className="min-w-0 flex-1 truncate">{cue.text}</span>
        </button>
      ))}
    </div>
  );
};
