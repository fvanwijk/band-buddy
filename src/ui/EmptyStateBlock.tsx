import type { ReactNode } from 'react';

type EmptyStateBlockProps = {
  children: ReactNode;
  icon: ReactNode;
};

export function EmptyStateBlock({ children, icon }: EmptyStateBlockProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
      <div className="mb-2 h-8 w-8 opacity-50">{icon}</div>
      {children}
    </div>
  );
}
