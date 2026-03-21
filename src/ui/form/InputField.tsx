import { useId } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { FieldError } from 'react-hook-form';

import { cn } from '../../utils/cn';
import { FormLabel } from './FormLabel';

type InputFieldProps = {
  error?: FieldError;
  helperText?: string;
  hideLabel?: boolean;
  id?: string;
  label: string;
  rows?: number;
  size?: 'medium' | 'small';
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

export function InputField({
  error,
  helperText,
  hideLabel,
  label,
  rows,
  ...inputProps
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = inputProps.id ?? generatedId;
  const isTextarea = rows !== undefined;
  const size = inputProps.size ?? 'medium';
  const inputClass = cn(
    'w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none',
    size === 'small' ? 'px-2 py-1 text-sm' : 'px-3 py-2',
    inputProps.className,
  );
  return (
    <div>
      {!hideLabel && (
        <FormLabel className="mb-1.5 block" htmlFor={inputId} required={inputProps.required}>
          {label}
        </FormLabel>
      )}
      {isTextarea ? (
        <textarea
          {...(inputProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          aria-label={hideLabel ? label : undefined}
          className={inputClass}
          id={inputId}
          rows={rows}
        />
      ) : (
        <input
          {...(inputProps as InputHTMLAttributes<HTMLInputElement>)}
          aria-label={hideLabel ? label : undefined}
          className={inputClass}
          id={inputId}
        />
      )}

      {error ? (
        <p className="mt-1 text-xs text-red-400">{error.message}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
