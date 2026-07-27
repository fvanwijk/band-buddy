import type { FC, PropsWithChildren } from 'react';

import { cn } from '../utils/cn';

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export const Card: FC<CardProps> = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6',
      className,
    )}
    {...props}
  />
);
