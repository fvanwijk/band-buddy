import { IconMusic } from '@tabler/icons-react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ActiveSetlistPage } from './active-setlist/ActiveSetlistPage';
import { SongDetailPage } from './active-setlist/song-detail/SongDetailPage';
import { AddSetlistPage } from './setlists/form/AddSetlistPage';
import { EditSetlistPage } from './setlists/form/EditSetlistPage';
import { ManageSetlistsPage } from './setlists/ManageSetlistsPage';
import { AddInstrumentPage } from './settings/instruments/form/AddInstrumentPage';
import { EditInstrumentPage } from './settings/instruments/form/EditInstrumentPage';
import { SettingsPage } from './settings/SettingsPage';
import { AddSongPage } from './songs/form/AddSongPage';
import { EditSongPage } from './songs/form/EditSongPage';
import { ManageSongsPage } from './songs/ManageSongsPage';
import { TopNav } from './ui/TopNav';

export function App() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-4 pt-2">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-900 bg-slate-950/80 backdrop-blur py-2">
        <span className="text-brand-400 font-bold text-md sm:text-2xl">
          Band
          <span className="font-semibold text-brand-600">
            b<IconMusic className="inline h-4 w-4 rotate-180 -mx-0.5" />
            ddy
          </span>
        </span>
        <TopNav />
      </header>

      <main className="min-h-0 flex-1 pt-1.5">
        <Routes>
          <Route path="/" element={<ActiveSetlistPage />} />
          <Route path="/setlist/:setlistId/song/:songId">
            <Route index element={<Navigate to="details" replace />} />
            <Route path=":tab" element={<SongDetailPage />} />
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
            <Route path=":tab" element={<EditSongPage />} />
          </Route>
          <Route path="/settings">
            <Route index element={<Navigate to="general" replace />} />
            <Route path=":tab" element={<SettingsPage />} />
          </Route>
          <Route path="/settings/instruments/add" element={<AddInstrumentPage />} />
          <Route path="/settings/instruments/:id/edit" element={<EditInstrumentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
