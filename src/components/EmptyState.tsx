import type { ReactNode } from 'react';

type EmptyStateProps = {
  description: string;
  icon: ReactNode;
  title: string;
};

export function EmptyState({ description, icon, title }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center py-16">
      <div className="rounded-full bg-brand-400/10 p-6 mb-4">
        <div className="w-12 h-12 text-brand-300 flex items-center justify-center">{icon}</div>
      </div>
      <h2 className="text-xl font-semibold text-slate-100 mb-2">{title}</h2>
      <p className="text-slate-400 max-w-md">{description}</p>
    </div>
  );
}
