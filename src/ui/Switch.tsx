import { forwardRef } from 'react';

import { cn } from '../utils/cn';

type SwitchProps = {
  checked: boolean;
  className?: string;
  onCheckedChange: (checked: boolean) => void;
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, className, onCheckedChange }, ref) => (
    <button
      ref={ref}
      aria-pressed={checked}
      className={cn(
        'relative inline-flex h-6 w-12 items-center rounded-full transition-colors',
        checked ? 'bg-brand-400/30' : 'bg-slate-700',
        className,
      )}
      onClick={() => onCheckedChange(!checked)}
      type="button"
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-slate-100 transition-transform',
          checked ? 'translate-x-7' : 'translate-x-1',
        )}
      />
    </button>
  ),
);

Switch.displayName = 'Switch';
