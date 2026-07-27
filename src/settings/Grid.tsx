import type { FC, PropsWithChildren } from 'react';

import { cn } from '../utils/cn';

type GridProps = PropsWithChildren<{ className?: string }>;

export const Grid: FC<GridProps> = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col divide-y divide-slate-900 rounded-md border border-slate-900',
      className,
    )}
    {...props}
  />
);
