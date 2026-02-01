import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type FormFieldProps = {
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

export function FormField({
  error,
  id,
  label,
  max,
  min,
  placeholder,
  register,
  required = false,
  type = 'text',
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="ml-1 text-brand-400/70">*</span>}
      </label>
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
