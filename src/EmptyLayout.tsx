import { type PropsWithChildren } from 'react';

import { Logo } from './ui/Logo';
import { TopNav } from './ui/TopNav';

export type LayoutProps = PropsWithChildren;

export function EmptyLayout({ children }: LayoutProps) {
  return (
    <>
      <div className="sticky top-0 z-30 mx-auto max-w-5xl bg-slate-950/80 backdrop-blur-xs">
        <header className="flex items-center justify-between gap-3 border-b border-slate-900 px-4 py-2">
          <Logo className="text-md sm:text-2xl" iconClassName="h-4 w-4" />
          <TopNav />
        </header>
      </div>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pt-2 pb-4">
        <main className="min-h-0 flex-1 pt-1.5">{children}</main>
      </div>
    </>
  );
}
