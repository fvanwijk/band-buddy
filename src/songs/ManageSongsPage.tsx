import { IconMusic, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { SongCard } from './SongCard';
import { useDeleteSong, useGetSongs } from '../api/useSong';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { Page } from '../ui/Page';
import { PageHeader } from '../ui/PageHeader';
import { SortButtonsBar } from '../ui/sorting/SortButtonsBar';
import { useSortState } from '../ui/sorting/useSortState';

type SortField = 'artist' | 'key' | 'title';

export function ManageSongsPage() {
  const allSongs = useGetSongs();
  let displayedSongs = allSongs;

  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const { sortBy, sortDirection, handleSort, isActive } = useSortState<SortField>(null, 'none');
  const deleteSong = useDeleteSong(() => setDeletingSongId(null));

  const handleDeleteSong = () => {
    if (deletingSongId) {
      deleteSong(deletingSongId);
    }
  };

  // Sort songs
  if (sortDirection !== 'none' && sortBy) {
    displayedSongs = [...allSongs].sort((songA, songB) => {
      const valueA = (songA[sortBy] as string).toLowerCase();
      const valueB = (songB[sortBy] as string).toLowerCase();

      const comparison = valueA.localeCompare(valueB);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }

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

      {displayedSongs.length === 0 ? (
        <EmptyState
          description="Add songs to build your repertoire and use them in setlists."
          icon={<IconMusic className="h-12 w-12" />}
          title="No songs in your library"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <SortButtonsBar
            fields={['title', 'artist', 'key'] as const}
            isActive={isActive}
            onSort={handleSort}
            sortDirection={sortDirection}
          />
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
