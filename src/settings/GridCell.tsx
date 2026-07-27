import type { FC, PropsWithChildren } from 'react';

import { cn } from '../utils/cn';

type GridCell = PropsWithChildren<{
  className?: string;
}>;

export const GridCell: FC<GridCell> = ({ className, ...props }) => (
  <div className={cn('p-6', className)} {...props} />
);
