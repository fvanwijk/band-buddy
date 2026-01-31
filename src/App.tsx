import { Navigate, Route, Routes } from 'react-router-dom';
import TopNav from './components/TopNav';
import ActiveSetlistPage from './pages/ActiveSetlistPage';
import ManageSetlistsPage from './pages/ManageSetlistsPage';
import ManageSongsPage from './pages/ManageSongsPage';
import AddSongPage from './pages/AddSongPage';
import EditSongPage from './pages/EditSongPage';
import SettingsPage from './pages/SettingsPage';
import { useEffect } from 'react';
import { applyTheme, getStoredTheme } from './config/triadicThemes';

function App() {
  useEffect(() => {
    // Apply stored theme on mount
    applyTheme(getStoredTheme());
  }, []);

  return (
    <div className="h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex h-full max-w-5xl flex-col gap-3 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-brand-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-200">
            Gig Buddy
          </span>
          <TopNav />
        </div>

        <main className="min-h-0 flex-1">
          <Routes>
            <Route path="/" element={<ActiveSetlistPage />} />
            <Route path="/manage" element={<ManageSetlistsPage />} />
            <Route path="/songs" element={<ManageSongsPage />} />
            <Route path="/songs/add" element={<AddSongPage />} />
            <Route path="/songs/edit/:id" element={<EditSongPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
