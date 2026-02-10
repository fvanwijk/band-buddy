import { useId } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { FieldError } from 'react-hook-form';

import { FormLabel } from './FormLabel';
import { cn } from '../../utils/cn';

type InputFieldProps = {
  error?: FieldError;
  helperText?: string;
  id?: string;
  label: string;
  rows?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

export function InputField({ error, helperText, label, rows, ...inputProps }: InputFieldProps) {
  const generatedId = useId();
  const inputId = inputProps.id ?? generatedId;
  const isTextarea = rows !== undefined;
  const inputClass = cn(
    'focus:border-brand-400 focus:ring-brand-400/20 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:outline-none',
    inputProps.className,
  );
  return (
    <div>
      <FormLabel className="mb-1.5 block" htmlFor={inputId} required={inputProps.required}>
        {label}
      </FormLabel>
      {isTextarea ? (
        <textarea
          {...(inputProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={inputClass}
          id={inputId}
          rows={rows}
        />
      ) : (
        <input
          {...(inputProps as InputHTMLAttributes<HTMLInputElement>)}
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
