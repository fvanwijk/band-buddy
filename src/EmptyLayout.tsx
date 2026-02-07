import { type PropsWithChildren } from 'react';

import { Logo } from './ui/Logo';

export type LayoutProps = PropsWithChildren;

export function EmptyLayout({ children }: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-4 pt-2">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-900 bg-slate-950/80 backdrop-blur py-2">
        <Logo className="text-md sm:text-2xl" iconClassName="h-4 w-4" />
      </header>

      <main className="min-h-0 flex-1 pt-1.5">{children}</main>
    </div>
  );
}
