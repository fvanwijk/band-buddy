import type { ReactNode } from 'react';

type EmptyStateProps = {
  description: ReactNode;
  icon: ReactNode;
  title: string;
};

export function EmptyState({ description, icon, title }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-brand-400/10 p-6">
        <div className="flex h-12 w-12 items-center justify-center text-brand-300">{icon}</div>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-slate-100">{title}</h2>
      <p className="max-w-md text-slate-400">{description}</p>
    </div>
  );
}
