import type { ReactNode } from 'react';

import { cn } from '../utils/cn';

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
      {required && <span className="ml-1 text-brand-400/70">*</span>}
    </label>
  );
}
