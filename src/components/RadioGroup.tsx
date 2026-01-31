import type { UseFormRegisterReturn, FieldError } from "react-hook-form";

type RadioOption = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  label: string;
  options: RadioOption[];
  error?: FieldError;
  register: UseFormRegisterReturn;
  className?: string;
  children?: React.ReactNode;
  required?: boolean;
};

export function RadioGroup({
  label,
  options,
  error,
  register,
  className = "",
  children,
  required = false,
}: RadioGroupProps) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">
          {label}
          {required && <span className="ml-1 text-brand-400/70">*</span>}
        </label>
        {children}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:border-brand-400/50 has-checked:border-brand-400 has-checked:bg-brand-400/10 has-checked:text-brand-200"
          >
            <input
              type="radio"
              value={option.value}
              {...register}
              className="h-4 w-4 text-brand-400 focus:ring-2 focus:ring-brand-400/20"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
