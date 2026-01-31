import type { ReactNode } from 'react';

type CardProps = {
  actions: ReactNode;
  children: ReactNode;
};

export function Card({ actions, children }: CardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="min-w-0 flex-1">{children}</div>
      <div className="ml-4 flex gap-2">{actions}</div>
    </div>
  );
}
