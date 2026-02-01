import { Navigate, Route, Routes } from 'react-router-dom';

import TopNav from './components/TopNav';
import ActiveSetlistPage from './pages/ActiveSetlistPage';
import { AddSetlistPage } from './pages/AddSetlistPage';
import AddSongPage from './pages/AddSongPage';
import { EditSetlistPage } from './pages/EditSetlistPage';
import EditSongPage from './pages/EditSongPage';
import { ManageSetlistsPage } from './pages/ManageSetlistsPage';
import ManageSongsPage from './pages/ManageSongsPage';
import SettingsPage from './pages/SettingsPage';
import SongDetailPage from './pages/SongDetailPage';

function App() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-brand-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-200">
          Gig Buddy
        </span>
        <TopNav />
      </div>

      <main className="min-h-0 flex-1">
        <Routes>
          <Route path="/" element={<ActiveSetlistPage />} />
          <Route path="/setlist/:setlistId/song/:songId" element={<SongDetailPage />} />
          <Route path="/setlists" element={<ManageSetlistsPage />} />
          <Route path="/setlists/add" element={<AddSetlistPage />} />
          <Route path="/setlists/edit/:id" element={<EditSetlistPage />} />
          <Route path="/songs" element={<ManageSongsPage />} />
          <Route path="/songs/add" element={<AddSongPage />} />
          <Route path="/songs/edit/:id" element={<EditSongPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
