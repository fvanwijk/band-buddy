import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { FormLabel } from './FormLabel';

type InputFieldProps = {
  error?: FieldError;
  id: string;
  label: string;
  max?: string;
  min?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  required?: boolean;
  type?: string;
};

export function InputField({
  error,
  id,
  label,
  max,
  min,
  placeholder,
  register,
  required = false,
  type = 'text',
}: InputFieldProps) {
  return (
    <div>
      <FormLabel className="mb-1.5 block" htmlFor={id} required={required}>
        {label}
      </FormLabel>
      <input
        id={id}
        max={max}
        min={min}
        placeholder={placeholder}
        type={type}
        {...register}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
