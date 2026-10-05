import type { FC, ReactNode } from 'react';

import { cn } from '../../utils/cn';

type TableProps = {
  children: ReactNode;
  className?: string;
  // Rows rendered inside the <thead>
  head: ReactNode;
};

export const Table: FC<TableProps> = ({ children, className, head }) => (
  <div className={cn('overflow-x-auto rounded-md', className)}>
    <table className="w-full border-collapse text-left text-sm text-slate-300">
      <thead className="border-b border-slate-900 text-xs text-slate-400 uppercase">{head}</thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);
