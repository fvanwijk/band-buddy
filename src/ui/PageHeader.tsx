import type { ReactNode } from 'react';

import { BackButton } from './BackButton';

type PageHeaderProps = {
  action?: ReactNode;
  backPath?: string;
  subtitle?: string;
  title: string;
};

export function PageHeader({ action, backPath, subtitle, title }: PageHeaderProps) {
  const header = (
    <header className="flex flex-1 flex-wrap items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-brand-300 text-xs font-semibold tracking-[0.3em] uppercase">
          {subtitle}
        </p>
        <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
      </div>
      {action}
    </header>
  );

  if (backPath) {
    return (
      <div className="flex items-center gap-3">
        <BackButton to={backPath} />
        {header}
      </div>
    );
  }

  return header;
}
