import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type FormFieldProps = {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  register: UseFormRegisterReturn;
  required?: boolean;
};

export function FormField({
  label,
  id,
  type = 'text',
  placeholder,
  error,
  register,
  required = false,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="ml-1 text-brand-400/70">*</span>}
      </label>
      <input
        id={id}
        type={type}
        {...register}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
