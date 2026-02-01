import type { ReactNode } from 'react';

type CardProps = {
  actions: ReactNode;
  children: ReactNode;
};

export function Card({ actions, children }: CardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-slate-700 bg-slate-900 p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="min-w-0 flex-1">{children}</div>
      <div className="ml-4 flex gap-2">{actions}</div>
    </div>
  );
}
