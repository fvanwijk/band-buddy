import { useId } from 'react';

import { cn } from '../utils/cn';
import { FormLabel } from './form/FormLabel';

type SwitchProps = {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
  label?: string;
  name?: string;
  onCheckedChange: (checked: boolean) => void;
  ref?: React.Ref<HTMLInputElement>;
};

export function Switch({ label, name, onCheckedChange, ref, ...inputProps }: SwitchProps) {
  const generatedId = useId();
  const inputId = inputProps.id || generatedId;

  return (
    <FormLabel htmlFor={inputId}>
      <input
        ref={ref}
        className="peer sr-only"
        id={inputId}
        name={name}
        onChange={(e) => onCheckedChange(e.target.checked)}
        role="switch"
        tabIndex={0}
        type="checkbox"
        {...inputProps}
      />
      <span
        aria-hidden="true"
        className={cn(
          'relative inline-flex h-6 w-12 items-center rounded-full transition-colors',
          inputProps.checked ? 'bg-brand-400/30' : 'bg-slate-700',
          inputProps.disabled && 'opacity-50',
          'peer-focus-visible:ring-brand-400 peer-focus-visible:ring-2',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-slate-100 transition-transform',
            inputProps.checked ? 'translate-x-7' : 'translate-x-1',
          )}
        />
      </span>
      {label && <span className="ml-2 text-sm text-slate-200">{label}</span>}
    </FormLabel>
  );
}
