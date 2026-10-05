import { IconArrowDown, IconArrowsSort, IconArrowUp } from '@tabler/icons-react';
import type { FC, ReactNode } from 'react';

import { cn } from '../../utils/cn';

type TableHeaderCellProps = {
  align?: 'left' | 'right';
  children?: ReactNode;
  className?: string;
  // Makes the header a sort button when set
  onSort?: () => void;
  sortDirection?: 'asc' | 'desc' | 'none';
};

const ariaSort = { asc: 'ascending', desc: 'descending', none: 'none' } as const;

export const TableHeaderCell: FC<TableHeaderCellProps> = ({
  align = 'left',
  children,
  className,
  onSort,
  sortDirection = 'none',
}) => {
  const SortIcon =
    sortDirection === 'asc'
      ? IconArrowUp
      : sortDirection === 'desc'
        ? IconArrowDown
        : IconArrowsSort;

  return (
    <th
      aria-sort={onSort ? ariaSort[sortDirection] : undefined}
      className={cn('px-3 py-1 font-semibold', align === 'right' && 'text-right', className)}
      scope="col"
    >
      {onSort ? (
        <button
          className={cn(
            'inline-flex items-center gap-1 uppercase hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-brand-400',
            sortDirection !== 'none' && 'text-slate-100',
          )}
          onClick={onSort}
          type="button"
        >
          {children}
          <SortIcon className={cn('h-3.5 w-3.5', sortDirection === 'none' && 'text-slate-600')} />
        </button>
      ) : (
        children
      )}
    </th>
  );
};
