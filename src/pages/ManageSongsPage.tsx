import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from 'tinybase/ui-react';

import { ConfirmDialog } from '../components/ConfirmDialog';
import { SongCard } from '../components/SongCard';
import { SortButton } from '../components/SortButton';
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
          <div className="mb-4 flex gap-4">
            {(['title', 'artist', 'key'] as const).map((field) => {
              const isActive = sortBy === field && sortDirection !== 'none';

              return (
                <SortButton
                  key={field}
                  isActive={isActive}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  onClick={() => handleSortFieldClick(field)}
                  sortDirection={isActive ? sortDirection : undefined}
                />
              );
            })}
          </div>
          <div className="grid gap-2">
            {songIds.map((songId) => {
              const song = songs[songId];

              return (
                <SongCard
                  key={songId}
                  artist={song.artist as string}
                  keyNote={song.key as string}
                  onDelete={() => setDeletingSongId(songId)}
                  songId={songId}
                  timeSignature={song.timeSignature as string}
                  title={song.title as string}
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default ManageSongsPage;
