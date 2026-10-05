import type { FC, HTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

export const TableRow: FC<HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr
    className={cn('border-b border-slate-900 last:border-b-0 hover:bg-slate-900/50', className)}
    {...props}
  />
);
