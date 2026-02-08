import { IconCheck } from '@tabler/icons-react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '../utils/cn';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export function Checkbox({ checked, className, label, onChange, ...props }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <div className="relative inline-flex">
        <input
          {...props}
          checked={checked}
          className="peer border-brand-200 hover:border-brand-300 checked:border-brand-500 checked:bg-brand-500 h-4 w-4 cursor-pointer appearance-none rounded border-2 bg-transparent transition-colors"
          onChange={onChange}
          type="checkbox"
        />
        <IconCheck
          className={cn(
            'pointer-events-none absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100',
            className,
          )}
        />
      </div>
      <span className="text-sm text-slate-400">{label}</span>
    </label>
  );
}
