import { useId } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import type { FieldError } from 'react-hook-form';

import { cn } from '../../utils/cn';
import { FormLabel } from './FormLabel';

type SelectOption =
  | { label: string; value: string }
  | { label: string; options: Array<{ label: string; value: string }> };

type SelectFieldProps = {
  error?: FieldError;
  helperText?: ReactNode;
  hideLabel?: boolean;
  inline?: boolean;
  label: string;
  options: SelectOption[];
  size?: 'medium' | 'small' | 'xsmall';
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>;

export function SelectField({
  error,
  helperText,
  hideLabel,
  inline,
  label,
  options,
  size = 'medium',
  ...selectProps
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = selectProps.id ?? generatedId;
  const selectClass = cn(
    'w-full rounded-lg border border-brand-900 bg-brand-950/40 pr-6 text-slate-100 hover:border-brand-700 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none',
    { medium: 'py-2 pl-3', small: 'py-1 pl-2.5', xsmall: 'py-1 pl-2 text-sm' }[size],
    selectProps.className,
  );

  return (
    <div className={cn(inline && 'flex items-center gap-3')}>
      {!hideLabel && (
        <FormLabel
          className={inline ? 'w-28 shrink-0' : 'mb-1.5 block'}
          htmlFor={selectId}
          required={selectProps.required}
        >
          {label}
        </FormLabel>
      )}
      <div className={cn(inline && 'min-w-0 flex-1')}>
        <select
          {...selectProps}
          aria-label={hideLabel ? label : undefined}
          className={selectClass}
          id={selectId}
        >
          {options.map((option) => {
            if ('value' in option) {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            }
            return (
              <optgroup key={option.label} label={option.label}>
                {option.options.map((groupOption) => (
                  <option key={groupOption.value} value={groupOption.value}>
                    {groupOption.label}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
        {error ? (
          <p className="mt-1 text-xs text-red-400">{error.message}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-400">{helperText}</p>
        ) : null}
      </div>
    </div>
  );
}
