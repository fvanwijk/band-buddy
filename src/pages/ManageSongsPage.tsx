import { IconMusic } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from 'tinybase/ui-react';

import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { SongCard } from '../components/SongCard';
import { SortButtonsBar } from '../components/SortButtonsBar';
import { useSortState } from '../hooks/useSortState';
import { useDeleteSong } from '../hooks/useSong';

type SortField = 'artist' | 'key' | 'title';

function ManageSongsPage() {
  const songs = useTable('songs');
  let songIds = Object.keys(songs);

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
    songIds = [...songIds].sort((idA, idB) => {
      const songA = songs[idA];
      const songB = songs[idB];

      const valueA = (songA[sortBy] as string).toLowerCase();
      const valueB = (songB[sortBy] as string).toLowerCase();

      const comparison = valueA.localeCompare(valueB);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  return (
    <section className="flex h-full flex-col gap-6">
      <PageHeader
        action={
          <Button as={Link} color="primary" to="/songs/add" variant="outlined">
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

      {songIds.length === 0 ? (
        <EmptyState
          description="Add songs to build your repertoire and use them in setlists."
          icon={<IconMusic className="w-12 h-12" />}
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
            {songIds.map((songId) => {
              const song = songs[songId];

              return (
                <SongCard
                  key={songId}
                  artist={song.artist as string}
                  duration={song.duration as string | undefined}
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
