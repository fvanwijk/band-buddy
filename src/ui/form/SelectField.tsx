import { useId } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import type { FieldError } from 'react-hook-form';

import { FormLabel } from './FormLabel';
import { cn } from '../../utils/cn';

type SelectOption =
  | { label: string; value: string }
  | { label: string; options: Array<{ label: string; value: string }> };

type SelectFieldProps = {
  error?: FieldError;
  helperText?: ReactNode;
  label?: string;
  options: SelectOption[];
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>;

export function SelectField({
  error,
  helperText,
  label,
  options,
  ...selectProps
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = selectProps.id ?? generatedId;
  const selectClass = cn(
    'focus:border-brand-400 focus:ring-brand-400/20 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:ring-2 focus:outline-none',
    selectProps.className,
  );

  return (
    <div>
      {label && (
        <FormLabel className="mb-1.5 block" htmlFor={selectId} required={selectProps.required}>
          {label}
        </FormLabel>
      )}
      <select {...selectProps} className={selectClass} id={selectId}>
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
  );
}
