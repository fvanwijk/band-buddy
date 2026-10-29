import type { ReactNode } from 'react';

import { cn } from '../utils/cn';

type ListItemProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function ListItem({ actions, children, className, contentClassName }: ListItemProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-between gap-4 overflow-hidden p-4 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className={cn('min-w-0 flex-1', contentClassName)}>{children}</div>
      {actions && <div className="relative z-10 ml-4 flex gap-2">{actions}</div>}
    </div>
  );
}
