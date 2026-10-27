import { useId } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '../../utils/cn';

type RadioOption = {
  className?: string;
  description?: string;
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
  inline?: boolean;
  listClassName?: string;
  required?: boolean;
  vertical?: boolean;
};

export function RadioGroup({
  label,
  options,
  error,
  register,
  className = '',
  children,
  inline = false,
  listClassName,
  required = false,
  vertical = false,
}: RadioGroupProps) {
  const id = useId();

  return (
    <div className={cn(inline && 'flex items-center gap-3', className)}>
      <div className={cn('flex items-center justify-between', inline ? 'w-28 shrink-0' : 'mb-2')}>
        <div className="text-sm font-medium text-slate-300">
          {label}
          {required && <span className="ml-1 text-brand-400/70">*</span>}
        </div>
        {children}
      </div>
      <div className={cn('flex gap-2', vertical ? 'flex-col' : 'flex-wrap', listClassName)}>
        {options.map((option) => {
          const labelId = `${id}-${option.value}-label`;
          const descriptionId = `${id}-${option.value}-description`;

          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer gap-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-300 hover:border-brand-400/50 has-checked:border-brand-400 has-checked:bg-brand-400/10 has-checked:text-brand-200',
                inline ? 'px-2 py-0.5' : 'px-3 py-2',
                option.description ? 'items-start' : 'items-center',
                option.className,
              )}
            >
              <input
                type="radio"
                value={option.value}
                {...register}
                aria-describedby={option.description ? descriptionId : undefined}
                aria-labelledby={option.description ? labelId : undefined}
                className={cn(
                  'h-4 w-4 text-brand-400 focus:ring-2 focus:ring-brand-400/20',
                  option.description && 'mt-0.5',
                )}
              />
              {option.description ? (
                <span className="flex flex-col">
                  <span id={labelId}>{option.label}</span>
                  <span className="text-xs text-slate-400" id={descriptionId}>
                    {option.description}
                  </span>
                </span>
              ) : (
                <span>{option.label}</span>
              )}
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
