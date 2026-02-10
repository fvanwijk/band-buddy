import { IconMusic, IconPlus, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { SongCard } from './SongCard';
import { useDeleteSong, useGetSongs } from '../api/useSong';
import { useSortedArray } from '../hooks/useSortedArray';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { Page } from '../ui/Page';
import { PageHeader } from '../ui/PageHeader';
import { SortButtonsBar } from '../ui/sorting/SortButtonsBar';
import { useSortState } from '../ui/sorting/useSortState';
import { pluralize } from '../utils/pluralize';

type SortField = 'artist' | 'key' | 'title';

export function ManageSongsPage() {
  const allSongs = useGetSongs();

  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { sortBy, sortDirection, handleSort, isActive } = useSortState<SortField>(null, 'none');
  const deleteSong = useDeleteSong(() => setDeletingSongId(null));

  const handleDeleteSong = () => {
    if (deletingSongId) {
      deleteSong(deletingSongId);
    }
  };

  // Sort songs first
  const sortedSongs = useSortedArray(allSongs, sortBy, sortDirection);

  // Then filter by search query
  const displayedSongs = searchQuery
    ? sortedSongs.filter((song) => {
        const query = searchQuery.toLowerCase();
        return (
          song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query)
        );
      })
    : sortedSongs;

  return (
    <Page>
      <PageHeader
        action={
          <Button
            as={Link}
            color="primary"
            iconStart={<IconPlus className="h-4 w-4" />}
            to="/songs/add"
            variant="outlined"
          >
            New song
          </Button>
        }
        title="Songs"
      />

      <ConfirmDialog
        isOpen={deletingSongId !== null}
        onClose={() => setDeletingSongId(null)}
        onConfirm={handleDeleteSong}
        title="Delete Song"
        message="Are you sure you want to delete this song? This action cannot be undone."
      />

      {sortedSongs.length === 0 ? (
        <EmptyState
          description="Add songs to build your repertoire and use them in setlists."
          icon={<IconMusic className="h-12 w-12" />}
          title="No songs in your library"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <SortButtonsBar
              fields={['title', 'artist', 'key'] as const}
              isActive={isActive}
              onSort={handleSort}
              sortDirection={sortDirection}
            />
            <span className="text-sm text-slate-100">
              Showing {displayedSongs.length} of {pluralize(sortedSongs.length, 'song')}
            </span>
          </div>
          <div className="relative">
            <IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pr-4 pl-10 text-slate-100 placeholder-slate-400 focus:ring-1 focus:outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or artist..."
              type="text"
              value={searchQuery}
            />
          </div>
          <div className="grid gap-2">
            {displayedSongs.map((song) => (
              <SongCard
                key={song.id}
                artist={song.artist}
                duration={song.duration}
                keyNote={song.key}
                onDelete={() => setDeletingSongId(song.id)}
                songId={song.id}
                timeSignature={song.timeSignature}
                title={song.title}
              />
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
