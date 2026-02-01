import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type SelectFieldProps = {
  error?: FieldError;
  id?: string;
  label?: string;
  onChange?: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  register?: UseFormRegisterReturn;
  required?: boolean;
  value?: string;
};

export function SelectField({
  error,
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
        <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor={id}>
          {label}
          {required && <span className="ml-1 text-brand-400/70">*</span>}
        </label>
      )}
      <select
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
        id={id}
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
