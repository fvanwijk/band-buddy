import type { ReactNode } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { FormLabel } from './FormLabel';

type SelectOption =
  | { label: string; value: string }
  | { label: string; options: Array<{ label: string; value: string }> };

type SelectFieldProps = {
  error?: FieldError;
  helperText?: ReactNode;
  id?: string;
  label?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  register?: UseFormRegisterReturn;
  required?: boolean;
  value?: string;
};

export function SelectField({
  error,
  helperText,
  id,
  label,
  onChange,
  options,
  register,
  required = false,
  value,
}: SelectFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const selectProps = register
    ? { ...register }
    : {
        onChange: handleChange,
        value,
      };

  return (
    <div>
      {label && (
        <FormLabel className="mb-1.5 block" htmlFor={id} required={required}>
          {label}
        </FormLabel>
      )}
      <select
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
        id={id}
        {...selectProps}
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
  );
}
