import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';

type FormLabelProps = {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  required?: boolean;
};

export function FormLabel({ children, className, htmlFor, required = false }: FormLabelProps) {
  return (
    <label className={cn('text-sm font-medium text-slate-300', className)} htmlFor={htmlFor}>
      {children}
      {required && <span className="text-brand-400/70 ml-1">*</span>}
    </label>
  );
}
