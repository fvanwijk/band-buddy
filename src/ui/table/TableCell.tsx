import type { FC, TdHTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

type TableCellProps = {
  align?: 'left' | 'right';
} & TdHTMLAttributes<HTMLTableCellElement>;

export const TableCell: FC<TableCellProps> = ({ align = 'left', className, ...props }) => (
  <td
    className={cn('px-3 py-1 align-middle', align === 'right' && 'text-right', className)}
    {...props}
  />
);
