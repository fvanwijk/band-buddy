import type { ReactNode } from 'react';

type PageHeaderProps = {
  action?: ReactNode;
  subtitle?: string;
  title: string;
};

export function PageHeader({ action, subtitle = 'Library', title }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">
          {subtitle}
        </p>
        <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
      </div>
      {action}
    </header>
  );
}
