import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { isMobileBrowser } from './active-setlist/song-detail/spotify-player/isMobileBrowser';
import { SpotifyWebPlayerProvider } from './active-setlist/song-detail/spotify-player/SpotifyWebPlayerProvider';
import {
  useGetShowSpotifyPlayer,
  useHasSeenWelcome,
  useSetHasSeenWelcome,
} from './api/useSettings';
import { useMidiEventLogContext } from './contexts/MidiEventLogContext';
import { useSpotify } from './contexts/SpotifyContext';
import { useWakeLock } from './hooks/useWakeLock';
import { useMidiEventLog } from './midi/useMidiEventLog';
import { MidiEventLogPanel } from './settings/instruments/MidiEventLogPanel';
import { Logo } from './ui/Logo';
import { TopNav } from './ui/TopNav';
import { WelcomeModal } from './ui/WelcomeModal';

// Mobile browsers can't play Spotify themselves, so there is no web player to keep alive
const isMobile = isMobileBrowser();

export function Layout() {
  useWakeLock();

  const showSpotifyPlayer = useGetShowSpotifyPlayer();
  const { isAuthenticated } = useSpotify();

  const hasSeenWelcome = useHasSeenWelcome();
  const setHasSeenWelcome = useSetHasSeenWelcome();
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(!hasSeenWelcome);
  const { isOpen: isMidiLogOpen, setIsOpen: setIsMidiLogOpen } = useMidiEventLogContext();
  const { clearLog, entries } = useMidiEventLog(isMidiLogOpen);

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
    setHasSeenWelcome(true);
  };

  return (
    <SpotifyWebPlayerProvider isEnabled={showSpotifyPlayer && isAuthenticated && !isMobile}>
      <div className="sticky top-0 z-30 border-b border-slate-900 bg-slate-950 backdrop-blur-xs">
        <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
          <Link to="/">
            <Logo className="text-md sm:text-2xl" iconClassName="h-4 w-4" />
          </Link>
          <TopNav />
        </header>
      </div>
      <div className="mx-auto flex max-w-5xl flex-col px-4 pt-2 pb-4">
        <main className="min-h-0 flex-1 pt-1.5">
          <Outlet />
        </main>

        <WelcomeModal isOpen={isWelcomeOpen} onClose={handleCloseWelcome} />
      </div>

      {isMidiLogOpen && (
        <MidiEventLogPanel
          entries={entries}
          onClear={clearLog}
          onClose={() => setIsMidiLogOpen(false)}
        />
      )}
    </SpotifyWebPlayerProvider>
  );
}
