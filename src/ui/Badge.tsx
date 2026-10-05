import type { FC, ReactNode } from 'react';

import { cn } from '../utils/cn';

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export const Badge: FC<BadgeProps> = ({ children, className }) => (
  <span
    className={cn(
      'inline-flex min-w-5 items-center justify-center rounded-full bg-brand-400/30 px-1.5 text-[10px] font-semibold tracking-normal text-brand-100',
      className,
    )}
  >
    {children}
  </span>
);
