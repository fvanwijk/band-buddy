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
  inline?: boolean;
  label: string;
  rows?: number;
  size?: 'medium' | 'small' | 'xsmall';
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

export function InputField({
  error,
  helperText,
  hideLabel,
  inline,
  label,
  rows,
  size = 'medium',
  ...inputProps
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = inputProps.id ?? generatedId;
  const isTextarea = rows !== undefined;
  const inputClass = cn(
    'w-full rounded-lg border border-brand-900 bg-brand-950/40 text-slate-100 placeholder-slate-500 hover:border-brand-700 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none',
    { medium: 'px-3 py-2', small: 'px-2.5 py-1', xsmall: 'px-2 py-1 text-sm' }[size],
    '[&::-webkit-calendar-picker-indicator]:invert',
    inputProps.className,
  );
  return (
    <div className={cn(inline && 'flex items-center gap-3')}>
      {!hideLabel && (
        <FormLabel
          className={inline ? 'w-28 shrink-0' : 'mb-1.5 block'}
          htmlFor={inputId}
          required={inputProps.required}
        >
          {label}
        </FormLabel>
      )}
      <div className={cn(inline && 'min-w-0 flex-1')}>
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
    </div>
  );
}
