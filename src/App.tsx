import { useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { ActiveSetlistPage } from './active-setlist/ActiveSetlistPage';
import { SongDetailPage } from './active-setlist/song-detail/SongDetailPage';
import { useHasSeenWelcome, useSetHasSeenWelcome } from './api/useSettings';
import { Home } from './home/Home';
import { NotFoundPage } from './NotFoundPage';
import { AddSetlistPage } from './setlists/form/AddSetlistPage';
import { EditSetlistPage } from './setlists/form/EditSetlistPage';
import { ManageSetlistsPage } from './setlists/ManageSetlistsPage';
import { AddInstrumentPage } from './settings/instruments/form/AddInstrumentPage';
import { EditInstrumentPage } from './settings/instruments/form/EditInstrumentPage';
import { SettingsPage } from './settings/SettingsPage';
import { SpotifyCallbackPage } from './settings/SpotifyCallbackPage';
import { AddSongPage } from './songs/form/AddSongPage';
import { EditSongPage } from './songs/form/EditSongPage';
import { ManageSongsPage } from './songs/ManageSongsPage';
import { Logo } from './ui/Logo';
import { TopNav } from './ui/TopNav';
import { WelcomeModal } from './ui/WelcomeModal';

export function App() {
  const hasSeenWelcome = useHasSeenWelcome();
  const setHasSeenWelcome = useSetHasSeenWelcome();
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(!hasSeenWelcome);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const githubUrl = 'https://github.com/fvanwijk/band-buddy';

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
    setHasSeenWelcome(true);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pt-2 pb-4">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-900 bg-slate-950/80 py-2 backdrop-blur">
        <Logo className="text-md sm:text-2xl" iconClassName="h-4 w-4" />
        {isLandingPage ? (
          <a
            className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase transition hover:text-slate-200"
            href={githubUrl}
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        ) : (
          <TopNav />
        )}
      </header>

      <main className="min-h-0 flex-1 pt-1.5">
        <Routes>
          <Route errorElement={<NotFoundPage />}>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<ActiveSetlistPage />} />
            <Route path="/setlist/:setlistId/song/:songId">
              <Route index element={<Navigate to="details" replace />} />
              <Route path=":tab" element={<SongDetailPage />} errorElement={<NotFoundPage />} />
            </Route>
            <Route path="/setlists" element={<ManageSetlistsPage />} />
            <Route path="/setlists/add" element={<AddSetlistPage />} />
            <Route path="/setlists/edit/:id" element={<EditSetlistPage />} />
            <Route path="/songs" element={<ManageSongsPage />} />
            <Route path="/songs/add">
              <Route index element={<Navigate to="details" replace />} />
              <Route path=":tab" element={<AddSongPage />} />
            </Route>
            <Route path="/songs/edit/:id">
              <Route index element={<Navigate to="details" replace />} />
              <Route path=":tab" element={<EditSongPage />} errorElement={<NotFoundPage />} />
            </Route>
            <Route path="/settings">
              <Route index element={<Navigate to="general" replace />} />
              <Route path=":tab" element={<SettingsPage />} />
            </Route>
            <Route path="/spotify-callback" element={<SpotifyCallbackPage />} />
            <Route path="/settings/instruments/add" element={<AddInstrumentPage />} />
            <Route
              path="/settings/instruments/:id/edit"
              element={<EditInstrumentPage />}
              errorElement={<NotFoundPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </main>

      {!isLandingPage && <WelcomeModal isOpen={isWelcomeOpen} onClose={handleCloseWelcome} />}
    </div>
  );
}
