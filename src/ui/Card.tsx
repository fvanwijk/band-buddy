import type { ReactNode } from 'react';

import { cn } from '../utils/cn';

type CardProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Card({ actions, children, className, contentClassName }: CardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 overflow-hidden rounded border border-slate-700 bg-slate-900 p-4 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className={cn('min-w-0 flex-1', contentClassName)}>{children}</div>
      {actions && <div className="ml-4 flex gap-2">{actions}</div>}
    </div>
  );
}
