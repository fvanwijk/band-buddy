import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from 'tinybase/ui-react';

import { ConfirmDialog } from '../components/ConfirmDialog';
import { store } from '../store/store';

type SortField = 'artist' | 'key' | 'title';
type SortDirection = 'asc' | 'desc' | 'none';

function ManageSongsPage() {
  const songs = useTable('songs');
  let songIds = Object.keys(songs);

  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('none');

  // Sort songs
  if (sortDirection !== 'none' && sortBy) {
    songIds = [...songIds].sort((idA, idB) => {
      const songA = songs[idA];
      const songB = songs[idB];

      const valueA = (songA[sortBy] as string).toLowerCase();
      const valueB = (songB[sortBy] as string).toLowerCase();

      const comparison = valueA.localeCompare(valueB);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  const handleDeleteSong = () => {
    if (deletingSongId) {
      store.delRow('songs', deletingSongId);
      setDeletingSongId(null);
    }
  };

  const handleSortFieldClick = (field: SortField) => {
    if (sortBy === field) {
      // Same field clicked: cycle through directions
      const cycle: Record<SortDirection, SortDirection> = {
        asc: 'desc',
        desc: 'none',
        none: 'asc',
      };
      setSortDirection(cycle[sortDirection]);
    } else {
      // Different field clicked: start with ascending
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <section className="flex h-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">Library</p>
          <h1 className="text-2xl font-semibold text-slate-100">Songs</h1>
        </div>
        <Link
          to="/songs/add"
          className="rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200 hover:bg-brand-400/20"
        >
          New song
        </Link>
      </header>

      <ConfirmDialog
        isOpen={deletingSongId !== null}
        onClose={() => setDeletingSongId(null)}
        onConfirm={handleDeleteSong}
        title="Delete Song"
        message="Are you sure you want to delete this song? This action cannot be undone."
      />

      {songIds.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-16">
          <div className="rounded-full bg-brand-400/10 p-6 mb-4">
            <svg
              className="w-12 h-12 text-brand-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">No songs in your library</h2>
          <p className="text-slate-400 max-w-md">
            Add songs to build your repertoire and use them in setlists.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5">
            {(['title', 'artist', 'key'] as const).map((field) => {
              const isActive = sortBy === field && sortDirection !== 'none';
              const directionSymbol = isActive ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : '';

              return (
                <button
                  key={field}
                  onClick={() => handleSortFieldClick(field)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'border border-brand-400/50 bg-brand-400/20 text-brand-100'
                      : 'border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {directionSymbol}
                </button>
              );
            })}
          </div>
          <div className="grid gap-2">
            {songIds.map((songId) => {
              const song = songs[songId];

              return (
                <div
                  key={songId}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 transition-colors hover:bg-slate-900/80"
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-slate-100 truncate">
                      {song.title as string}
                    </h2>
                    <p className="text-xs text-slate-500">{song.artist as string}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="hidden text-xs text-slate-400 sm:inline">
                      {song.key as string}
                    </span>
                    <span className="hidden text-xs text-slate-400 sm:inline">
                      {song.timeSignature as string}
                    </span>
                    <Link
                      to={`/songs/edit/${songId}`}
                      className="rounded-md border border-brand-400/20 bg-brand-400/5 p-1.5 text-brand-300 transition-all hover:bg-brand-400/15"
                      title="Edit"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>
                    <button
                      onClick={() => setDeletingSongId(songId)}
                      className="rounded-md border border-red-500/20 bg-red-500/5 p-1.5 text-red-400 transition-all hover:bg-red-500/15"
                      title="Delete"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default ManageSongsPage;
