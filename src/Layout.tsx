import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useHasSeenWelcome, useSetHasSeenWelcome } from './api/useSettings';
import { Logo } from './ui/Logo';
import { TopNav } from './ui/TopNav';
import { WelcomeModal } from './ui/WelcomeModal';

export function Layout() {
  const hasSeenWelcome = useHasSeenWelcome();
  const setHasSeenWelcome = useSetHasSeenWelcome();
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(!hasSeenWelcome);

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
    setHasSeenWelcome(true);
  };

  return (
    <>
      <div className="sticky top-0 z-30 mx-auto max-w-5xl bg-slate-950/80 backdrop-blur-xs">
        <header className="flex items-center justify-between gap-3 border-b border-slate-900 py-2">
          <Logo className="text-md sm:text-2xl" iconClassName="h-4 w-4" />
          <TopNav />
        </header>
      </div>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pt-2 pb-4">
        <main className="min-h-0 flex-1 pt-1.5">
          <Outlet />
        </main>

        <WelcomeModal isOpen={isWelcomeOpen} onClose={handleCloseWelcome} />
      </div>
    </>
  );
}
