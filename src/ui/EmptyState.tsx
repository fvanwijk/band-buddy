import type { ReactNode } from 'react';

type EmptyStateProps = {
  description: ReactNode;
  icon: ReactNode;
  title: string;
};

export function EmptyState({ description, icon, title }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <div className="bg-brand-400/10 mb-4 rounded-full p-6">
        <div className="text-brand-300 flex h-12 w-12 items-center justify-center">{icon}</div>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-slate-100">{title}</h2>
      <p className="max-w-md text-slate-400">{description}</p>
    </div>
  );
}
